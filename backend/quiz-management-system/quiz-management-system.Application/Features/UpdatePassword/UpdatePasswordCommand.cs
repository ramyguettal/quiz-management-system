using MediatR;
using quiz_management_system.Application.Dtos;
using quiz_management_system.Application.Events;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.UpdatePassword;

public record UpdatePasswordCommand(string UserId, string CurrentPassword, string NewPassword, string UserIpAddress) : IRequest<Result>;





public sealed class UpdatePasswordCommandHandler
    : IRequestHandler<UpdatePasswordCommand, Result>
{
    private readonly IIdentityService _identityService;
    private readonly IPublisher _publisher;

    public UpdatePasswordCommandHandler(
        IIdentityService identityService,
        IPublisher publisher)
    {
        _identityService = identityService;
        _publisher = publisher;
    }

    public async Task<Result> Handle(
        UpdatePasswordCommand request,
        CancellationToken cancellationToken)
    {
        var result = await _identityService.ChangePasswordAsync(
            request.UserId,
            request.CurrentPassword,
            request.NewPassword);

        if (result.IsFailure)
            return result;

        Result<AuthenticatedUser> userResult = await _identityService.GetUserByIdAsync(request.UserId);

        if (userResult.IsFailure)
        {
            FailureResult<AuthenticatedUser>? failure = userResult as FailureResult<AuthenticatedUser>;

            return Result.Failure(failure!.Error);
        }
        AuthenticatedUser user = (userResult as SuccessResult<AuthenticatedUser>)!.Value;
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
