using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Common.Errors;
using quiz_management_system.Application.Dtos;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Infrastructure.Data;

namespace quiz_management_system.Domain.Common.Identity;

public class RefreshTokenService : IRefreshTokenService
{
    private readonly AppDbContext _db;
    private readonly IIdentityService _identityService;

    public RefreshTokenService(AppDbContext db, IIdentityService identityService)
    {
        _db = db;
        _identityService = identityService;
    }

    public async Task<Result<AuthenticatedUser>> GetUserFromRefreshTokenAsync(
        string refreshToken,
        CancellationToken ct)
    {
        var dbToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken, ct);
        if (dbToken is null || !dbToken.IsActive)
            return Result.Failure<AuthenticatedUser>(TokenError.Invalid("Invalid or Expired Refresh Token"));
        if (dbToken.IsExpired)
            return Result.Failure<AuthenticatedUser>(TokenError.Expired("Refresh token expired."));

        if (dbToken.IsRevoked)
            return Result.Failure<AuthenticatedUser>(TokenError.Revoked("Refresh token revoked."));
        dbToken.Revoke();
        await _db.SaveChangesAsync(ct);



        var userResult = await _identityService.GetUserByIdAsync(dbToken.IdentityId);
        if (userResult.IsFailure)
            return userResult;

        return userResult;
    }
}