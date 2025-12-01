using quiz_management_system.Application.Dtos;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Result;

public interface IRefreshTokenService : IScopedService
{
    Task<Result<AuthenticatedUser>> GetUserFromRefreshTokenAsync(
        string refreshToken,
        CancellationToken ct);
}