using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Notifications.Commands.DeleteAllNotifications;

public sealed class DeleteAllNotificationsCommandHandler(
    IAppDbContext db,
    IUserContext userContext)
    : IRequestHandler<DeleteAllNotificationsCommand, Result>
{
    public async Task<Result> Handle(
        DeleteAllNotificationsCommand request,
        CancellationToken ct)
    {
        Guid? nullableUserId = userContext.UserId;
        if (nullableUserId is null)
            return Result.Failure(UserError.Unauthorized());

        await db.Notifications
            .Where(n => n.UserId == nullableUserId.Value)
            .ExecuteDeleteAsync(ct);

        return Result.Success();
    }
}
