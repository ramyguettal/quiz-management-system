using MediatR;
using quiz_management_system.Application.Dtos;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Identity;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Login;

public sealed class LoginCommandHandler(
    IIdentityService identityService,
    ITokenProvider tokenProvider
) : IRequestHandler<LoginCommand, Result<AuthDto>>
{
    public async Task<Result<AuthDto>> Handle(
        LoginCommand request,
        CancellationToken cancellationToken)
    {
        Result<AuthenticatedUser> authResult =
            await identityService.AuthenticateByEmailAsync(
                request.Email,
                request.Password);

        if (authResult.IsFailure)
            return Result.Failure<AuthDto>(authResult.TryGetError());

        AuthenticatedUser user = authResult.TryGetValue();

        Result<AuthDto> tokenResult =
            await tokenProvider.GenerateJwtTokenAsync(
                user,
                request.DeviceId,
                cancellationToken);

        if (tokenResult.IsFailure)
            return Result.Failure<AuthDto>(tokenResult.TryGetError());

        return tokenResult;
    }
}
