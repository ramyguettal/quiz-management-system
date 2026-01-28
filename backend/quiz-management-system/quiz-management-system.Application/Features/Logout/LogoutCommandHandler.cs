using MediatR;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Logout;

public sealed class LogoutCommandHandler(
    IRefreshTokenService refreshTokenService
) : IRequestHandler<LogoutCommand, Result>
{
    public async Task<Result> Handle(
        LogoutCommand request,
        CancellationToken cancellationToken)
    {
        // If a specific refresh token is provided, revoke only that token
        if (!string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            await refreshTokenService.RevokeAsync(
                request.RefreshToken,
                cancellationToken);
        }

        // Revoke all active tokens for this user on this device
        await refreshTokenService.RevokeActiveTokensAsync(
            request.UserId,
            request.DeviceId,
            cancellationToken);

        return Result.Success();
    }
}
