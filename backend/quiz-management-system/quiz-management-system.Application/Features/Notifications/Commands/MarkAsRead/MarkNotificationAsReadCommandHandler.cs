using MediatR;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Notifications.Commands.MarkAsRead;

public sealed class MarkNotificationAsReadCommandHandler(
    IAppDbContext db,
    IUserContext userContext,
    INotificationRepository notificationRepository)
    : IRequestHandler<MarkNotificationAsReadCommand, Result>
{
    public async Task<Result> Handle(
        MarkNotificationAsReadCommand request,
        CancellationToken ct)
    {
        Guid? nullableUserId = userContext.UserId;
        if (nullableUserId is null)
            return Result.Failure(UserError.Unauthorized());

        Guid userId = nullableUserId.Value;

        Result markResult = await notificationRepository.MarkAsReadAsync(
            request.NotificationId,
            userId,
            ct);

        if (markResult.IsFailure)
            return markResult;

        await db.SaveChangesAsync(ct);

        return Result.Success();
    }
}