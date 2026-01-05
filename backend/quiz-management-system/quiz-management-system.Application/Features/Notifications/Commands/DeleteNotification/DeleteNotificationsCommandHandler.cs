using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Notifications.Commands.DeleteNotification;

public sealed class DeleteNotificationsCommandHandler(
    IAppDbContext db,
    IUserContext userContext)
    : IRequestHandler<DeleteNotificationsCommand, Result>
{
    public async Task<Result> Handle(
        DeleteNotificationsCommand request,
        CancellationToken ct)
    {
        Guid? nullableUserId = userContext.UserId;
        if (nullableUserId is null)
            return Result.Failure(UserError.Unauthorized());

        if (request.NotificationIds is null || request.NotificationIds.Count == 0)
            return Result.Success();
        Guid userId = nullableUserId.Value;

        int affectedRows = await db.Notifications
            .Where(n =>
                request.NotificationIds.Contains(n.Id) &&
                n.UserId == userId)
            .ExecuteDeleteAsync(ct);

        if (affectedRows == 0)
            return Result.Failure(DomainError.NotFound(nameof(DomainNotification)));

        return Result.Success();
    }
}