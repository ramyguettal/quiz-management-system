using quiz_management_system.Application.Common.Settings;
using quiz_management_system.Application.Dtos;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Domain.Common.Identity;

public sealed class TokenRefreshMiddleware(
    RequestDelegate next,
    ITokenProvider tokenProvider,
    IRefreshTokenService refreshTokens,
    IAuthCookieWriter cookieWriter,
    JwtSettings jwtSettings,
    ILogger<TokenRefreshMiddleware> logger)
{
    // Proactive refresh window: refresh the access token if it expires within this duration.
    private static readonly TimeSpan ProactiveRefreshThreshold = TimeSpan.FromMinutes(1);
 
    private const string AccessTokenCookie  = "access_token";
    private const string RefreshTokenCookie = "refresh_token";
    private const string DeviceIdCookie     = "device_id";
 
    public async Task InvokeAsync(HttpContext context)
    {
        CancellationToken ct = context.RequestAborted;
 
        try
        {
            await HandleTokenAsync(context, ct);
        }
        catch (Exception ex)
        {
            // A refresh failure must never crash the pipeline.
            // The auth middleware downstream will handle unauthenticated access.
            logger.LogError(ex,
                "Unhandled exception in {Middleware}. Request continues unauthenticated.",
                nameof(TokenRefreshMiddleware));
        }
 
        await next(context);
    }
 
    // ── Core logic ────────────────────────────────────────────────────────
 
    private async Task HandleTokenAsync(HttpContext context, CancellationToken ct)
    {
        string? accessToken  = context.Request.Cookies[AccessTokenCookie];
        string? refreshToken = context.Request.Cookies[RefreshTokenCookie];
        string? deviceId     = context.Request.Cookies[DeviceIdCookie];
 
        // ── Case 1: No access token cookie ────────────────────────────────
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            if (!string.IsNullOrWhiteSpace(refreshToken) && !string.IsNullOrWhiteSpace(deviceId))
            {
                logger.LogDebug("No access token found. Attempting silent refresh.");
                await TryRefreshAsync(context, refreshToken, deviceId, ct);
            }
 
            return;
        }
 
        // ── Validate JWT structure (ignoring lifetime) ─────────────────────
        ClaimsPrincipal? principal = tokenProvider.GetPrincipalFromExpiredToken(accessToken);
 
        if (principal is null)
        {
            // Case 4: Tampered / malformed token — clear cookies, do NOT refresh.
            logger.LogWarning(
                "Access token cookie failed structural validation (tampered or wrong algorithm). " +
                "Clearing cookies.");
            cookieWriter.Clear();
            return;
        }
 
        // ── Determine token expiry ─────────────────────────────────────────
        DateTime? expiresAt = ExtractExpiry(principal);
 
        if (expiresAt is null)
        {
            // Cannot determine expiry — treat as expired.
            logger.LogWarning("Access token has no expiry claim. Treating as expired.");
 
            if (!string.IsNullOrWhiteSpace(refreshToken) && !string.IsNullOrWhiteSpace(deviceId))
                await TryRefreshAsync(context, refreshToken, deviceId, ct);
 
            return;
        }
 
        TimeSpan remaining = expiresAt.Value - DateTime.UtcNow;
 
        // ── Case 3: Still valid with comfortable margin ────────────────────
        if (remaining > ProactiveRefreshThreshold)
        {
            // Token is healthy — inject it so UseAuthentication() picks it up
            // even if it wasn't in the Authorization header (cookie-only clients).
            InjectBearerToken(context, accessToken);
            return;
        }
 
        // ── Case 2 / 5: Expiring soon or already expired ─────────────────
        if (remaining > TimeSpan.Zero)
        {
            logger.LogDebug(
                "Access token expires in {Remaining:mm\\:ss}. Proactively refreshing.",
                remaining);
        }
        else
        {
            logger.LogDebug("Access token is expired. Attempting silent refresh.");
        }
 
        if (!string.IsNullOrWhiteSpace(refreshToken) && !string.IsNullOrWhiteSpace(deviceId))
        {
            await TryRefreshAsync(context, refreshToken, deviceId, ct);
        }
        else
        {
            // No refresh token available → clear stale access token cookie.
            logger.LogDebug(
                "Access token is expired/expiring but no refresh token cookie found. " +
                "Clearing cookies.");
            cookieWriter.Clear();
        }
    }
 
    // ── Refresh orchestration ─────────────────────────────────────────────
 
    private async Task TryRefreshAsync(
        HttpContext context,
        string refreshToken,
        string deviceId,
        CancellationToken ct)
    {
        // Validate refresh token and retrieve the associated user.
        Result<AuthenticatedUser> userResult =
            await refreshTokens.GetUserFromRefreshTokenAsync(refreshToken, deviceId, ct);
 
        if (userResult.IsFailure)
        {
            // Case 5: Refresh token invalid, revoked, or expired.
            logger.LogInformation(
                "Refresh token validation failed: {Error}. Clearing cookies.",
                userResult.TryGetError());
            cookieWriter.Clear();
            return;
        }
 
        AuthenticatedUser user = userResult.TryGetValue();
 
        // Issue a brand-new JWT + refresh token pair.
        Result<AuthDto> authResult =
            await tokenProvider.GenerateJwtTokenAsync(user, deviceId, ct);
 
        if (authResult.IsFailure)
        {
            logger.LogError(
                "Token generation failed after valid refresh for user {UserId}: {Error}",
                user.Id,
                authResult.TryGetError());
            cookieWriter.Clear();
            return;
        }
 
        AuthDto auth = authResult.TryGetValue();
 
        // Overwrite both cookies on the response.
        cookieWriter.Write(auth);
 
        // Inject the new access token into this request's Authorization header
        // so UseAuthentication() / [Authorize] work for the CURRENT request
        // without requiring a client round-trip.
        InjectBearerToken(context, auth.JwtToken.Token);
 
        logger.LogInformation(
            "Silent token refresh succeeded for user {UserId} on device {DeviceId}.",
            user.Id,
            deviceId);
    }
 
    // ── Helpers ───────────────────────────────────────────────────────────
 
    /// <summary>
    /// Injects the token into the Authorization header so the downstream
    /// JWT bearer middleware authenticates the current in-flight request.
    /// </summary>
    private static void InjectBearerToken(HttpContext context, string token)
    {
        context.Request.Headers[HeaderNames.Authorization] = $"Bearer {token}";
    }
 
    /// <summary>
    /// Extracts the <c>exp</c> claim and converts it from Unix epoch to UTC DateTime.
    /// Returns <c>null</c> when the claim is absent or malformed.
    /// </summary>
    private static DateTime? ExtractExpiry(ClaimsPrincipal principal)
    {
        string? expValue = principal.FindFirstValue(JwtRegisteredClaimNames.Exp);
 
        if (string.IsNullOrWhiteSpace(expValue))
            return null;
 
        if (!long.TryParse(expValue, out long unixSeconds))
            return null;
 
        return DateTimeOffset.FromUnixTimeSeconds(unixSeconds).UtcDateTime;
    }
}