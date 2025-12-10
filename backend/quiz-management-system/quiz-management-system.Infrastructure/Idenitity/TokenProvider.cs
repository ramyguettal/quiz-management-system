using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using quiz_management_system.Application.Common.Settings;
using quiz_management_system.Application.Dtos;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Identity;
using quiz_management_system.Domain.Common.Identity;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Infrastructure.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace quiz_management_system.Infrastructure.Idenitity;

public class TokenProvider(AppDbContext Context, JwtSettings Jwt, IHttpContextAccessor _httpContext) : ITokenProvider
{
    private const int RefreshTokenLifetimeDays = 90;




    public async Task<Result> GenerateJwtTokenAsync(AuthenticatedUser user, CancellationToken ct = default)
        => await CreateAsync(user, ct);

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Jwt.SecretKey)),

            ValidateIssuer = true,
            ValidIssuer = Jwt.Issuer,

            ValidateAudience = true,
            ValidAudience = Jwt.Audience,

            ValidateLifetime = false, // ignore expiration
            ClockSkew = TimeSpan.Zero
        };

        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);

            if (securityToken is not JwtSecurityToken jwtToken ||
                !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            return principal;
        }
        catch (SecurityTokenExpiredException)
        {
            // token is expired, but signature is still valid -> safe fallback
            var jwtToken = tokenHandler.ReadJwtToken(token);
            return new ClaimsPrincipal(new ClaimsIdentity(jwtToken.Claims));
        }
        catch (Exception)
        {
            // token is invalid, signature failed, malformed, tampered
            return null;
        }
    }
    private async Task<Result> CreateAsync(AuthenticatedUser user, CancellationToken ct)
    {
        DateTime expiresAt = DateTime.UtcNow.AddMinutes(Jwt.AccessTokenExpirationMinutes);

        // JWT claims
        var claims = new List<Claim>
    {
        new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
        new(JwtRegisteredClaimNames.Jti, Guid.CreateVersion7().ToString()),

    };

        if (!string.IsNullOrWhiteSpace(user.Email))
            claims.Add(new(JwtRegisteredClaimNames.Email, user.Email));



        if (!string.IsNullOrWhiteSpace(user.FullName))
            claims.Add(new(ClaimTypes.Name, user.FullName));



        if (!string.IsNullOrWhiteSpace(user.Role))
            claims.Add(new Claim(ClaimTypes.Role, user.Role));




        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Issuer = Jwt.Issuer,
            Audience = Jwt.Audience,
            Expires = expiresAt,

            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Jwt.SecretKey)),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.CreateToken(descriptor);


        await Context.RefreshTokens
     .Where(rt =>
         rt.IdentityId == user.Id &&
         rt.RevokedAt == null &&
         rt.ExpiresAt > DateTimeOffset.UtcNow)
     .ForEachAsync(rt => rt.Revoke(), ct);

        // Generate new refresh token
        TokenResponse refreshTokenResponse = GenerateRefreshToken();

        var refreshTokenResult = RefreshToken.Create(
            userId: user.Id,
            token: refreshTokenResponse.Token,
            lifetime: TimeSpan.FromDays(RefreshTokenLifetimeDays));

        if (refreshTokenResult is FailureResult<RefreshToken> failure)
            return Result.Failure<AuthResponse>(failure.Error);

        RefreshToken refreshToken = (refreshTokenResult as SuccessResult<RefreshToken>)!.Value;

        Context.RefreshTokens.Add(refreshToken);
        await Context.SaveChangesAsync(ct);


        string jwtToken = handler.WriteToken(jwt);




        _httpContext.HttpContext.Response.Cookies.Append("access_token", jwtToken, new CookieOptions
        {
            HttpOnly = true,         // JS cannot read it
            Secure = true,           // HTTPS only
            SameSite = SameSiteMode.None,
            Expires = expiresAt,
            Path = "/"
        });

        _httpContext.HttpContext.Response.Cookies.Append("refresh_token", refreshTokenResponse.Token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = refreshTokenResponse.ExpiresAt,
            Path = "/"
        });



        return Result.Success();
    }

    private static TokenResponse GenerateRefreshToken()
    {
        string token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        return new TokenResponse(
            Token: token,
            ExpiresAt: DateTime.UtcNow.AddDays(RefreshTokenLifetimeDays)
        );
    }
}