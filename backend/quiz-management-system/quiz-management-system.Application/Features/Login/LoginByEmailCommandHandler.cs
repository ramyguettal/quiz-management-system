using MediatR;
using quiz_management_system.Application.Dtos;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Identity;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Login;

public sealed class LoginByEmailCommandHandler(IIdentityService identityService, ITokenProvider tokenProvider) : IRequestHandler<LoginCommand, Result>
{

    public async Task<Result> Handle(LoginCommand request, CancellationToken cancellationToken)
    {


        Result<AuthenticatedUser> authResult = await identityService.AuthenticateByEmailAsync(request.Email, request.Password);
        if (authResult is FailureResult<AuthenticatedUser> failureAuth)
            return Result.Failure<AuthResponse>(failureAuth.Error);

        AuthenticatedUser authUser = authResult.TryGetValue();

        Result tokenResult = await tokenProvider.GenerateJwtTokenAsync(authUser, cancellationToken);
        if (tokenResult.IsFailure)
            return tokenResult;

        return Result.Success();
    }
}
