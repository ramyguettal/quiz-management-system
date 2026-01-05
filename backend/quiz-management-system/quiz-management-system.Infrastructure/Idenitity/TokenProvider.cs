using Microsoft.IdentityModel.Tokens;
using quiz_management_system.Application.Common.Settings;
using quiz_management_system.Application.Dtos;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Identity;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace quiz_management_system.Infrastructure.Identity;

public sealed class TokenProvider(
    IRefreshTokenService refreshTokens,
    JwtSettings jwt
) : ITokenProvider
{
    public async Task<Result<AuthDto>> GenerateJwtTokenAsync(
        AuthenticatedUser user,
        string deviceId,
        CancellationToken ct = default)
    {
        DateTime expiresAt =
            DateTime.UtcNow.AddMinutes(jwt.AccessTokenExpirationMinutes);

        List<Claim> claims = BuildClaims(user);

        SecurityTokenDescriptor descriptor = new()
        {
            Subject = new ClaimsIdentity(claims),
            Issuer = jwt.Issuer,
            Audience = jwt.Audience,
            Expires = expiresAt,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwt.SecretKey)),
                SecurityAlgorithms.HmacSha256)
        };

        JwtSecurityTokenHandler handler = new();
        SecurityToken securityToken = handler.CreateToken(descriptor);
        string accessToken = handler.WriteToken(securityToken);

        Result revokeResult = await refreshTokens.RevokeActiveTokensAsync(
            user.Id,
            deviceId,
            ct);

        if (revokeResult.IsFailure)
            return Result.Failure<AuthDto>(revokeResult.TryGetError());

        TokenResponse refresh = GenerateRefreshToken();

        Result addResult = await refreshTokens.AddAsync(
            user.Id,
            refresh.Token,
            deviceId,
            ct);

        if (addResult.IsFailure)
            return Result.Failure<AuthDto>(addResult.TryGetError());

        return Result.Success(
            new AuthDto(
                user.Id.ToString(),
                user.Email,
                user.FullName,
                user.Role,
                new TokenResponse(accessToken, expiresAt),
                refresh));
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        TokenValidationParameters parameters = new()
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwt.SecretKey)),
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Audience,
            ValidateLifetime = false,
            ClockSkew = TimeSpan.Zero
        };

        JwtSecurityTokenHandler handler = new();

        try
        {
            ClaimsPrincipal principal =
                handler.ValidateToken(token, parameters, out SecurityToken validated);

            if (validated is not JwtSecurityToken jwtToken ||
                jwtToken.Header.Alg != SecurityAlgorithms.HmacSha256)
                return null;

            return principal;
        }
        catch
        {
            return null;
        }
    }

    private TokenResponse GenerateRefreshToken()
    {
        string token = Convert.ToBase64String(
            RandomNumberGenerator.GetBytes(64));

        return new TokenResponse(
            token,
            DateTime.UtcNow.AddDays(jwt.RefreshTokenExpirationDays));
    }

    private static List<Claim> BuildClaims(AuthenticatedUser user)
    {
        List<Claim> claims =
        [
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.CreateVersion7().ToString())
        ];

        if (!string.IsNullOrWhiteSpace(user.Email))
            claims.Add(new(JwtRegisteredClaimNames.Email, user.Email));

        if (!string.IsNullOrWhiteSpace(user.FullName))
            claims.Add(new(ClaimTypes.Name, user.FullName));

        if (!string.IsNullOrWhiteSpace(user.Role))
            claims.Add(new(ClaimTypes.Role, user.Role));

        return claims;
    }
}
