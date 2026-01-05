
using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Responses.Notifications;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using System.Globalization;

namespace quiz_management_system.Application.Features.Notifications.Queries.GetNotifications;

public sealed class GetNotificationsQueryHandler(
    IAppDbContext db,
    IUserContext userContext)
    : IRequestHandler<GetNotificationsQuery, Result<CursorPagedResponse<NotificationResponse>>>
{
    public async Task<Result<CursorPagedResponse<NotificationResponse>>> Handle(
        GetNotificationsQuery request,
        CancellationToken ct)
    {
        Guid? nullableUserId = userContext.UserId;
        if (nullableUserId is null)
            return Result.Failure<CursorPagedResponse<NotificationResponse>>(
                UserError.Unauthorized());

        Guid userId = nullableUserId.Value;
        int pageSize = Math.Clamp(request.PageSize, 1, 50);

        DateTimeOffset? cursor = string.IsNullOrWhiteSpace(request.Cursor)
            ? null
            : DateTimeOffset.Parse(
                request.Cursor,
                CultureInfo.InvariantCulture,
                DateTimeStyles.RoundtripKind);

        IQueryable<DomainNotification> query = db.Notifications
            .Where(n =>
                n.UserId == userId &&
                (cursor == null || n.CreatedUtc < cursor))
            .OrderByDescending(n => n.CreatedUtc);

        List<DomainNotification> items = await query
            .Take(pageSize + 1)
            .ToListAsync(ct);

        bool hasNextPage = items.Count > pageSize;
        DomainNotification? lastItem = hasNextPage
            ? items[pageSize - 1]
            : items.LastOrDefault();

        List<NotificationResponse> responseItems = items
            .Take(pageSize)
            .Select(n => new NotificationResponse(
                n.Id,
                n.Title,
                n.Body,
                n.IsRead,
                n.CreatedUtc,
                n.Type,
                n.Data))
            .ToList();

        string? nextCursor = lastItem is null
            ? null
            : lastItem.CreatedUtc.ToString("O");

        return Result.Success(
            new CursorPagedResponse<NotificationResponse>(
                responseItems,
                nextCursor,
                hasNextPage));
    }
}
