using MediatR;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.ResetPassword;

public sealed class ResetPasswordWithCodeCommandHandler(
    IIdentityService identityService
) : IRequestHandler<ResetPasswordWithCodeCommand, Result>
{
    public async Task<Result> Handle(
        ResetPasswordWithCodeCommand request,
        CancellationToken cancellationToken)
    {

        var userResult = await identityService.GetUserByIdAsync(request.UserId);
        if (userResult.IsFailure)
            return Result.Failure(userResult.TryGetError());

        var resetResult = await identityService.ResetPasswordWithCodeAsync(
            request.UserId,
            request.Code,
            request.NewPassword,
            cancellationToken
        );

        return resetResult;
    }
}