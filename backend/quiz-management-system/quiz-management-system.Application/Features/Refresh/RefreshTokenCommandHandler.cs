using MediatR;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Identity;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Refresh;

public sealed class RefreshTokenCommandHandler(
    IRefreshTokenService refreshTokenService,
    ITokenProvider tokenProvider
) : IRequestHandler<RefreshTokenCommand, Result<AuthDto>>
{
    public async Task<Result<AuthDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var userResult = await refreshTokenService.GetUserFromRefreshTokenAsync(
            request.RefreshToken,
            request.DeviceId,
            cancellationToken
        );

        if (userResult.IsFailure)
            return Result.Failure<AuthDto>(userResult.TryGetError());

        var user = userResult.TryGetValue();

        Result<AuthDto> tokenResult = await tokenProvider.GenerateJwtTokenAsync(user, request.DeviceId, cancellationToken);


        return tokenResult;
    }
}