using MediatR;
using quiz_management_system.Application.Dtos;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Identity;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.GoogleLogin;

public sealed class GoogleLoginCommandHandler(
    IExternalAuthService externalAuthService,
    ITokenProvider tokenProvider
) : IRequestHandler<GoogleLoginCommand, Result<AuthDto>>
{
    public async Task<Result<AuthDto>> Handle(
        GoogleLoginCommand request,
        CancellationToken cancellationToken)
    {
        Result<AuthenticatedUser> authResult =
            await externalAuthService.SignInWithGoogleAsync(cancellationToken);

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