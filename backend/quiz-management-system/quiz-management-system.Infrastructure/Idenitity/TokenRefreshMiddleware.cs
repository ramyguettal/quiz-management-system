using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Net.Http.Headers;
using quiz_management_system.Application.Dtos;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Identity;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Domain.Common.Identity;

/// <summary>
/// Transparently refreshes JWT access tokens before they expire, injects the
/// Bearer header into the current request, and guards against token forgery and
/// concurrent refresh races.
///
/// Flow summary
/// ────────────
///   A) No access token  → silent refresh (if refresh token + device ID present)
///   B) Token healthy    → inject as Bearer and continue
///   C) Token expiring   → proactive refresh, then inject
///   D) Token expired    → silent refresh, then inject
///
/// Security guards
/// ───────────────
///   • Structural JWT validation (signature / algorithm) before trusting any claim
///   • Missing exp claim → reject + flag
///   • Inflated lifetime (possible forgery) → reject + flag
///   • Per-device semaphore prevents concurrent refresh races
///   • All suspicious events are routed through a single, extendable hook
/// </summary>
public sealed class TokenRefreshMiddleware : IDisposable
{
    // ── Tuning constants ──────────────────────────────────────────────────

    /// <summary>
    /// How long before expiry we proactively swap the token.
    /// Wide enough to survive slow networks and mild clock skew.
    /// </summary>
    private static readonly TimeSpan ProactiveRefreshThreshold = TimeSpan.FromMinutes(5);

    /// <summary>
    /// Absolute ceiling on any legitimate token's remaining lifetime.
    /// A token claiming more than this was almost certainly forged.
    /// </summary>
    private static readonly TimeSpan MaxAllowedTokenLifetime = TimeSpan.FromMinutes(16);

    /// <summary>
    /// How long a request waits to acquire the per-device refresh lock.
    /// If the lock isn't free within this window the request proceeds
    /// without refreshing — the in-flight sibling will update the cookies.
    /// </summary>
    private static readonly TimeSpan RefreshLockTimeout = TimeSpan.FromSeconds(5);

    // ── Cookie names ──────────────────────────────────────────────────────

    private const string AccessTokenCookie  = "access_token";
    private const string RefreshTokenCookie = "refresh_token";
    private const string DeviceIdCookie     = "device_id";

    // ── Per-device refresh locks ──────────────────────────────────────────

    /// <summary>
    /// One semaphore per device ID.  Concurrent requests from the same device
    /// queue here instead of racing to exchange the same refresh token — which
    /// would cause all-but-one to fail after server-side rotation.
    ///
    /// NOTE: Semaphores accumulate for the lifetime of the process.  For most
    /// deployments (bounded device count) this is acceptable.  If you expect
    /// millions of distinct device IDs consider evicting idle entries with an
    /// IMemoryCache&lt;string, SemaphoreSlim&gt; and a sliding expiration.
    /// </summary>
    private static readonly ConcurrentDictionary<string, SemaphoreSlim> RefreshLocks = new();

    // ── Dependencies ──────────────────────────────────────────────────────

    private readonly RequestDelegate               _next;
    private readonly ITokenProvider               _tokenProvider;
    private readonly IRefreshTokenService         _refreshTokens;
    private readonly IAuthCookieWriter            _cookieWriter;
    private readonly ILogger<TokenRefreshMiddleware> _logger;

    // ── Constructor ───────────────────────────────────────────────────────

    public TokenRefreshMiddleware(
        RequestDelegate next,
        ITokenProvider tokenProvider,
        IRefreshTokenService refreshTokens,
        IAuthCookieWriter cookieWriter,
        ILogger<TokenRefreshMiddleware> logger)
    {
        _next          = next;
        _tokenProvider = tokenProvider;
        _refreshTokens = refreshTokens;
        _cookieWriter  = cookieWriter;
        _logger        = logger;
    }

    // ── Pipeline entry ────────────────────────────────────────────────────

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await HandleTokenAsync(context, context.RequestAborted);
        }
        catch (Exception ex)
        {
            // Never crash the pipeline.  Log and let UseAuthentication() deny
            // the request if the token could not be injected.
            _logger.LogError(ex,
                "Unhandled exception in {Middleware}. Request continues without a refreshed token.",
                nameof(TokenRefreshMiddleware));
        }

        await _next(context);
    }

    // ── Core logic ────────────────────────────────────────────────────────

    private async Task HandleTokenAsync(HttpContext context, CancellationToken ct)
    {
        // Anonymous / public endpoints — nothing to do.
        if (!RequiresAuthorization(context))
            return;

        string? accessToken  = context.Request.Cookies[AccessTokenCookie];
        string? refreshToken = context.Request.Cookies[RefreshTokenCookie];
        string? deviceId     = context.Request.Cookies[DeviceIdCookie];

        // ── Case A: No access token ───────────────────────────────────────
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            if (!string.IsNullOrWhiteSpace(refreshToken) && !string.IsNullOrWhiteSpace(deviceId))
            {
                _logger.LogDebug("No access token. Attempting silent refresh.");
                await TryRefreshWithLockAsync(context, refreshToken, deviceId, ct);
            }
            else
            {
                _logger.LogDebug("No access token and no refresh token — skipping.");
            }

            return;
        }

        // ── Structural validation (signature / algorithm) ─────────────────
        // NOTE: "FromExpiredToken" is the existing method name; it validates
        // structure and claims but intentionally ignores token lifetime,
        // which is correct here because we handle expiry ourselves below.
        ClaimsPrincipal? principal = _tokenProvider.GetPrincipalFromExpiredToken(accessToken);

        if (principal is null)
        {
            // Structurally invalid or wrong signing algorithm.
            // Never refresh on a tampered token — clear everything and bail.
            _logger.LogWarning(
                "Access token failed structural validation (tampered / wrong algorithm). " +
                "Clearing auth cookies. IP: {IP}",
                context.Connection.RemoteIpAddress);

            FlagSuspiciousActivity(context, SuspiciousReason.StructuralValidationFailed);
            _cookieWriter.Clear();
            return;
        }

        // ── Expiry extraction ─────────────────────────────────────────────
        DateTime? expiresAt = ExtractExpiry(principal);

        if (expiresAt is null)
        {
            _logger.LogWarning(
                "Access token is missing the exp claim — rejecting. IP: {IP}",
                context.Connection.RemoteIpAddress);

            FlagSuspiciousActivity(context, SuspiciousReason.MissingExpiryClaim);
            _cookieWriter.Clear();
            return;
        }

        // Single calculation — used for both the forgery guard and the
        // refresh-threshold check below (fixes the duplicate computation
        // that existed in the original version).
        TimeSpan remaining = expiresAt.Value - DateTime.UtcNow;

        // ── Forgery guard: inflated lifetime ──────────────────────────────
        if (remaining > MaxAllowedTokenLifetime)
        {
            _logger.LogWarning(
                "Access token claims an excessive remaining lifetime ({Remaining}). " +
                "Possible token forgery. Clearing cookies. IP: {IP}",
                remaining,
                context.Connection.RemoteIpAddress);

            FlagSuspiciousActivity(context, SuspiciousReason.ExcessiveTokenLifetime);
            _cookieWriter.Clear();
            return;
        }

        // ── Case B: Token healthy — inject and continue ───────────────────
        if (remaining > ProactiveRefreshThreshold)
        {
            InjectBearerToken(context, accessToken);
            return;
        }

        // ── Cases C & D: Expiring soon or already expired ─────────────────
        if (remaining > TimeSpan.Zero)
        {
            _logger.LogDebug(
                "Access token expires in {Remaining:mm\\:ss} — proactively refreshing.",
                remaining);
        }
        else
        {
            _logger.LogDebug(
                "Access token expired {Ago:mm\\:ss} ago — attempting silent refresh.",
                remaining.Negate());
        }

        if (!string.IsNullOrWhiteSpace(refreshToken) && !string.IsNullOrWhiteSpace(deviceId))
        {
            await TryRefreshWithLockAsync(context, refreshToken, deviceId, ct);
        }
        else
        {
            _logger.LogDebug(
                "Token expired / expiring but no refresh token available — clearing cookies.");
            _cookieWriter.Clear();
        }
    }

    // ── Refresh ───────────────────────────────────────────────────────────

    /// <summary>
    /// Acquires a per-device exclusive lock before delegating to
    /// <see cref="TryRefreshAsync"/>.  This serialises concurrent requests
    /// from the same device so only one of them actually exchanges the
    /// refresh token.  Any sibling that times out on the lock simply
    /// continues without refreshing; the cookies written by the winner
    /// will be used on the next request.
    /// </summary>
    private async Task TryRefreshWithLockAsync(
        HttpContext context,
        string refreshToken,
        string deviceId,
        CancellationToken ct)
    {
        SemaphoreSlim gate = RefreshLocks.GetOrAdd(deviceId, _ => new SemaphoreSlim(1, 1));

        bool acquired = await gate.WaitAsync(RefreshLockTimeout, ct);

        if (!acquired)
        {
            _logger.LogWarning(
                "Could not acquire refresh lock for DeviceId: {DeviceId} within {Timeout}. " +
                "A sibling request is likely already refreshing — skipping.",
                deviceId,
                RefreshLockTimeout);

            return;
        }

        try
        {
            await TryRefreshAsync(context, refreshToken, deviceId, ct);
        }
        finally
        {
            gate.Release();
        }
    }

    private async Task TryRefreshAsync(
        HttpContext context,
        string refreshToken,
        string deviceId,
        CancellationToken ct)
    {
        Result<AuthenticatedUser> userResult =
            await _refreshTokens.GetUserFromRefreshTokenAsync(refreshToken, deviceId, ct);

        if (userResult.IsFailure)
        {
            _logger.LogWarning(
                "Refresh token validation failed: {Error}. Clearing cookies. IP: {IP}",
                userResult.TryGetError(),
                context.Connection.RemoteIpAddress);

            _cookieWriter.Clear();
            return;
        }

        AuthenticatedUser user = userResult.TryGetValue();

        Result<AuthDto> authResult =
            await _tokenProvider.GenerateJwtTokenAsync(user, deviceId, ct);

        if (authResult.IsFailure)
        {
            _logger.LogError(
                "Token generation failed after successful refresh validation. " +
                "UserId: {UserId}, Error: {Error}",
                user.Id,
                authResult.TryGetError());

            _cookieWriter.Clear();
            return;
        }

        AuthDto auth = authResult.TryGetValue();

        _cookieWriter.Write(auth);
        InjectBearerToken(context, auth.JwtToken.Token);

        _logger.LogInformation(
            "Silent token refresh succeeded. UserId: {UserId}, DeviceId: {DeviceId}, IP: {IP}",
            user.Id,
            deviceId,
            context.Connection.RemoteIpAddress);
    }

    // ── Suspicious activity hook ──────────────────────────────────────────

    private enum SuspiciousReason
    {
        StructuralValidationFailed,
        MissingExpiryClaim,
        ExcessiveTokenLifetime,
    }

    /// <summary>
    /// Central extension point for all suspicious token events.
    ///
    /// Currently emits a structured log entry compatible with any aggregator
    /// (Seq, Elastic, Datadog, Splunk …).  To harden further, add calls here
    /// to your audit store, IP rate-limiter, or ban-list service:
    ///
    /// <code>
    ///   await _auditService.RecordAsync(new SuspiciousTokenEvent(reason, context), ct);
    ///   await _rateLimiter.IncrementAsync(context.Connection.RemoteIpAddress, ct);
    /// </code>
    /// </summary>
    private void FlagSuspiciousActivity(HttpContext context, SuspiciousReason reason)
    {
        _logger.LogWarning(
            "[SUSPICIOUS_TOKEN] Reason: {Reason} | IP: {IP} | Path: {Path} | UserAgent: {UA}",
            reason,
            context.Connection.RemoteIpAddress,
            context.Request.Path,
            context.Request.Headers.UserAgent.ToString());

        // ── Plug-in point ──────────────────────────────────────────────────
        // e.g. _auditService.Record(reason, context);
        // e.g. _ipBanService.RegisterStrike(context.Connection.RemoteIpAddress);
    }

    // ── Static helpers ────────────────────────────────────────────────────

    /// <summary>
    /// Returns true only for endpoints that carry <see cref="IAuthorizeData"/>
    /// and do NOT carry <see cref="IAllowAnonymous"/>.
    /// Null endpoints (unmatched routes) are treated as public.
    /// </summary>
    private static bool RequiresAuthorization(HttpContext context)
    {
        var endpoint = context.GetEndpoint();

        if (endpoint is null)
            return false;

        if (endpoint.Metadata.GetMetadata<IAllowAnonymous>() is not null)
            return false;

        return endpoint.Metadata.GetMetadata<IAuthorizeData>() is not null;
    }

    private static void InjectBearerToken(HttpContext context, string token) =>
        context.Request.Headers[HeaderNames.Authorization] = $"Bearer {token}";

    private static DateTime? ExtractExpiry(ClaimsPrincipal principal)
    {
        string? expValue = principal.FindFirstValue(JwtRegisteredClaimNames.Exp);

        if (string.IsNullOrWhiteSpace(expValue) || !long.TryParse(expValue, out long unix))
            return null;

        return DateTimeOffset.FromUnixTimeSeconds(unix).UtcDateTime;
    }

    // ── IDisposable ───────────────────────────────────────────────────────

    /// <summary>
    /// Releases all semaphores accumulated in <see cref="RefreshLocks"/>.
    /// Called automatically on application shutdown when the middleware is
    /// registered via the DI container.
    /// </summary>
    public void Dispose()
    {
        foreach ((_, SemaphoreSlim semaphore) in RefreshLocks)
            semaphore.Dispose();

        RefreshLocks.Clear();
    }
}





/*




using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Net.Http.Headers;
using quiz_management_system.Application.Dtos;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Identity;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Domain.Common.Identity;

/// <summary>
/// Transparently refreshes JWT access tokens before they expire and injects the
/// Bearer header into the current request.
///
//
/// Flow
/// ────
///   A) No access token  → silent refresh (if refresh token present)
///   B) Token healthy    → inject as Bearer and continue
///   C) Token expiring   → proactive refresh, then inject
///   D) Token expired    → silent refresh, then inject
///
/// Security guards
/// ───────────────
///   • Structural JWT validation (signature / algorithm) before trusting any claim
///   • Missing exp claim         → reject + clear cookies + flag
///   • Inflated lifetime         → reject + clear cookies + flag (possible forgery)
///   • All suspicious events     → single centralised hook (easy to extend)
/// </summary>
public sealed class TokenRefreshMiddleware
{
    // ── Tuning constants ──────────────────────────────────────────────────

    /// <summary>
    /// How long before expiry we proactively swap the token.
    /// Wide enough to survive slow networks and mild clock skew.
    /// </summary>
    private static readonly TimeSpan ProactiveRefreshThreshold = TimeSpan.FromMinutes(5);

    /// <summary>
    /// Absolute ceiling on any legitimate token's remaining lifetime.
    /// A token claiming more than this was almost certainly forged.
    /// </summary>
    private static readonly TimeSpan MaxAllowedTokenLifetime = TimeSpan.FromMinutes(16);

    // ── Cookie names ──────────────────────────────────────────────────────

    private const string AccessTokenCookie  = "access_token";
    private const string RefreshTokenCookie = "refresh_token";

    // ── Dependencies ──────────────────────────────────────────────────────

    private readonly RequestDelegate                 _next;
    private readonly ITokenProvider                  _tokenProvider;
    private readonly IRefreshTokenService            _refreshTokens;
    private readonly IAuthCookieWriter               _cookieWriter;
    private readonly ILogger<TokenRefreshMiddleware> _logger;

    // ── Constructor ───────────────────────────────────────────────────────

    public TokenRefreshMiddleware(
        RequestDelegate next,
        ITokenProvider tokenProvider,
        IRefreshTokenService refreshTokens,
        IAuthCookieWriter cookieWriter,
        ILogger<TokenRefreshMiddleware> logger)
    {
        _next          = next;
        _tokenProvider = tokenProvider;
        _refreshTokens = refreshTokens;
        _cookieWriter  = cookieWriter;
        _logger        = logger;
    }

    // ── Pipeline entry ────────────────────────────────────────────────────

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await HandleTokenAsync(context, context.RequestAborted);
        }
        catch (Exception ex)
        {
            // Never crash the pipeline. Log and let UseAuthentication() deny
            // the request if the token could not be injected.
            _logger.LogError(ex,
                "Unhandled exception in {Middleware}. Request continues without a refreshed token.",
                nameof(TokenRefreshMiddleware));
        }

        await _next(context);
    }

    // ── Core logic ────────────────────────────────────────────────────────

    private async Task HandleTokenAsync(HttpContext context, CancellationToken ct)
    {
        // Anonymous / public endpoints — nothing to do.
        if (!RequiresAuthorization(context))
            return;

        string? accessToken  = context.Request.Cookies[AccessTokenCookie];
        string? refreshToken = context.Request.Cookies[RefreshTokenCookie];

        // ── Case A: No access token ───────────────────────────────────────
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            if (!string.IsNullOrWhiteSpace(refreshToken))
            {
                _logger.LogDebug("No access token present. Attempting silent refresh.");
                await TryRefreshAsync(context, refreshToken, ct);
            }
            else
            {
                _logger.LogDebug("No access token and no refresh token — skipping.");
            }

            return;
        }

        // ── Structural validation (signature / algorithm) ─────────────────
        // GetPrincipalFromExpiredToken validates structure and signing but
        // intentionally ignores lifetime — we handle expiry ourselves below.
        ClaimsPrincipal? principal = _tokenProvider.GetPrincipalFromExpiredToken(accessToken);

        if (principal is null)
        {
            _logger.LogWarning(
                "Access token failed structural validation (tampered / wrong algorithm). " +
                "Clearing auth cookies. IP: {IP}",
                context.Connection.RemoteIpAddress);

            FlagSuspiciousActivity(context, SuspiciousReason.StructuralValidationFailed);
            _cookieWriter.Clear();
            return;
        }

        // ── Expiry extraction ─────────────────────────────────────────────
        DateTime? expiresAt = ExtractExpiry(principal);

        if (expiresAt is null)
        {
            _logger.LogWarning(
                "Access token is missing the exp claim. Clearing cookies. IP: {IP}",
                context.Connection.RemoteIpAddress);

            FlagSuspiciousActivity(context, SuspiciousReason.MissingExpiryClaim);
            _cookieWriter.Clear();
            return;
        }

        TimeSpan remaining = expiresAt.Value - DateTime.UtcNow;

        // ── Forgery guard: inflated lifetime ──────────────────────────────
        if (remaining > MaxAllowedTokenLifetime)
        {
            _logger.LogWarning(
                "Access token claims an excessive remaining lifetime ({Remaining}). " +
                "Possible forgery. Clearing cookies. IP: {IP}",
                remaining,
                context.Connection.RemoteIpAddress);

            FlagSuspiciousActivity(context, SuspiciousReason.ExcessiveTokenLifetime);
            _cookieWriter.Clear();
            return;
        }

        // ── Case B: Token healthy — inject and continue ───────────────────
        if (remaining > ProactiveRefreshThreshold)
        {
            InjectBearerToken(context, accessToken);
            return;
        }

        // ── Cases C & D: Expiring soon or already expired ─────────────────
        if (remaining > TimeSpan.Zero)
            _logger.LogDebug(
                "Access token expires in {Remaining:mm\\:ss} — proactively refreshing.", remaining);
        else
            _logger.LogDebug(
                "Access token expired {Ago:mm\\:ss} ago — attempting silent refresh.", remaining.Negate());

        if (!string.IsNullOrWhiteSpace(refreshToken))
            await TryRefreshAsync(context, refreshToken, ct);
        else
        {
            _logger.LogDebug("Token expired / expiring but no refresh token available — clearing cookies.");
            _cookieWriter.Clear();
        }
    }

    // ── Refresh ───────────────────────────────────────────────────────────

    private async Task TryRefreshAsync(HttpContext context, string refreshToken, CancellationToken ct)
    {
        Result<AuthenticatedUser> userResult =
            await _refreshTokens.GetUserFromRefreshTokenAsync(refreshToken, ct);

        if (userResult.IsFailure)
        {
            _logger.LogWarning(
                "Refresh token validation failed: {Error}. Clearing cookies. IP: {IP}",
                userResult.TryGetError(),
                context.Connection.RemoteIpAddress);

            _cookieWriter.Clear();
            return;
        }

        AuthenticatedUser user = userResult.TryGetValue();

        Result<AuthDto> authResult =
            await _tokenProvider.GenerateJwtTokenAsync(user, ct);

        if (authResult.IsFailure)
        {
            _logger.LogError(
                "Token generation failed after successful refresh validation. UserId: {UserId}, Error: {Error}",
                user.Id,
                authResult.TryGetError());

            _cookieWriter.Clear();
            return;
        }

        AuthDto auth = authResult.TryGetValue();

        _cookieWriter.Write(auth);
        InjectBearerToken(context, auth.JwtToken.Token);

        _logger.LogInformation(
            "Silent token refresh succeeded. UserId: {UserId}, IP: {IP}",
            user.Id,
            context.Connection.RemoteIpAddress);
    }

    // ── Suspicious activity hook ──────────────────────────────────────────

    private enum SuspiciousReason
    {
        StructuralValidationFailed,
        MissingExpiryClaim,
        ExcessiveTokenLifetime,
    }

    /// <summary>
    /// Central extension point for all suspicious token events.
    /// Emits structured log entries compatible with any aggregator
    /// (Seq, Elastic, Datadog, Splunk …).
    ///
    /// To harden further, plug in additional calls here:
    /// <code>
    ///   await _auditService.RecordAsync(new SuspiciousTokenEvent(reason, context), ct);
    ///   await _rateLimiter.IncrementAsync(context.Connection.RemoteIpAddress, ct);
    /// </code>
    /// </summary>
    private void FlagSuspiciousActivity(HttpContext context, SuspiciousReason reason)
    {
        _logger.LogWarning(
            "Suspicious token event. Reason: {Reason} | IP: {IP} | Path: {Path} | UserAgent: {UA}",
            reason,
            context.Connection.RemoteIpAddress,
            context.Request.Path,
            context.Request.Headers.UserAgent.ToString());
    }

    // ── Static helpers ────────────────────────────────────────────────────

    /// <summary>
    /// Returns true only for endpoints decorated with <see cref="IAuthorizeData"/>
    /// that do NOT carry <see cref="IAllowAnonymous"/>.
    /// Unmatched routes (null endpoint) are treated as public.
    /// </summary>
    private static bool RequiresAuthorization(HttpContext context)
    {
        var endpoint = context.GetEndpoint();

        if (endpoint is null)
            return false;

        if (endpoint.Metadata.GetMetadata<IAllowAnonymous>() is not null)
            return false;

        return endpoint.Metadata.GetMetadata<IAuthorizeData>() is not null;
    }

    private static void InjectBearerToken(HttpContext context, string token) =>
        context.Request.Headers[HeaderNames.Authorization] = $"Bearer {token}";

    private static DateTime? ExtractExpiry(ClaimsPrincipal principal)
    {
        string? expValue = principal.FindFirstValue(JwtRegisteredClaimNames.Exp);

        return string.IsNullOrWhiteSpace(expValue) || !long.TryParse(expValue, out long unix)
            ? null
            : DateTimeOffset.FromUnixTimeSeconds(unix).UtcDateTime;
    }
}
*/