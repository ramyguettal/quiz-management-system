using MediatR;
using quiz_management_system.Application.Dtos;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Events;

namespace quiz_management_system.Application.Features.ForgotPassword;

public sealed class ForgetPasswordCommandHandler(
    IIdentityService identityService, IPublisher publisher
) : IRequestHandler<ForgetPasswordCommand, Result>
{
    public async Task<Result> Handle(
        ForgetPasswordCommand request,
        CancellationToken cancellationToken)
    {

        Result<AuthenticatedUser> result = await identityService.FindUserByEmailAsync(request.Email);
        if (result.IsFailure) return Result.Success();

        AuthenticatedUser user = result.TryGetValue();
        await publisher.Publish(new ResetPasswordEvent(user.Id, user.Email, user.FullName, user.Role));

        return Result.Success();

    }
}
