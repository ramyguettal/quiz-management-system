using MediatR;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Refresh;

public sealed record RefreshTokenCommand(string RefreshToken)
    : IRequest<Result>;



public sealed class RefreshTokenCommandHandler(
    IRefreshTokenService refreshTokenService,
    ITokenProvider tokenProvider
) : IRequestHandler<RefreshTokenCommand, Result>
{
    public async Task<Result> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var userResult = await refreshTokenService.GetUserFromRefreshTokenAsync(
            request.RefreshToken,
            cancellationToken
        );

        if (userResult.IsFailure)
            return Result.Failure(userResult.TryGetError());

        var user = userResult.TryGetValue();

        Result tokenResult = await tokenProvider.GenerateJwtTokenAsync(user, cancellationToken);

        if (tokenResult.IsFailure)
            return tokenResult;
        return Result.Success();
    }
}