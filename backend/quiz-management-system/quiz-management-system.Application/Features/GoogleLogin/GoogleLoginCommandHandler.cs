using Mapster;
using MediatR;
using quiz_management_system.Application.Dtos;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Identity;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.GoogleLogin;

public sealed class GoogleLoginCommandHandler(
    IExternalAuthService externalAuthService,
    ITokenProvider tokenProvider)
    : IRequestHandler<GoogleLoginCommand, Result<AuthResponse>>
{
    public async Task<Result<AuthResponse>> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {

        Result<AuthenticatedUser> authResult =
            await externalAuthService.SignInWithGoogleAsync(cancellationToken);

        if (authResult.IsFailure)
            return Result.Failure<AuthResponse>(authResult.TryGetError());

        AuthenticatedUser user = authResult.TryGetValue();

        Result tokenResult = await tokenProvider.GenerateJwtTokenAsync(user, cancellationToken);

        if (tokenResult.IsFailure)
            return Result.Failure<AuthResponse>(tokenResult.TryGetError());

        return Result.Success(user.Adapt<AuthResponse>());
    }
}