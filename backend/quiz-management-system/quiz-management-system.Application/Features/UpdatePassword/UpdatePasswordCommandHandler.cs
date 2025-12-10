using MediatR;
using quiz_management_system.Application.Dtos;
using quiz_management_system.Application.Events;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.UpdatePassword;

public sealed class UpdatePasswordCommandHandler(IIdentityService _identityService, IPublisher _publisher, IUserContext userContext)
    : IRequestHandler<UpdatePasswordCommand, Result>
{


    public async Task<Result> Handle(
        UpdatePasswordCommand request,
        CancellationToken cancellationToken)
    {

        Guid? userId = userContext.UserId;
        if (userId is null) return Result.Failure(UserError.NotFound());

        var result = await _identityService.ChangePasswordAsync(
            userId.Value,
            request.CurrentPassword,
            request.NewPassword);

        if (result.IsFailure)
            return result;

        Result<AuthenticatedUser> userResult = await _identityService.GetUserByIdAsync(userId.Value);

        if (userResult.IsFailure)
            return Result.Failure(userResult.TryGetError());

        AuthenticatedUser user = userResult.TryGetValue();
        await _publisher.Publish(
           new PasswordUpdatedEvent(
               Email: user.Email!,
               FullName: user.FullName!,
               IpAddress: request.UserIpAddress,
               Timestamp: DateTime.UtcNow),
           cancellationToken
       );

        return Result.Success();
    }
}
