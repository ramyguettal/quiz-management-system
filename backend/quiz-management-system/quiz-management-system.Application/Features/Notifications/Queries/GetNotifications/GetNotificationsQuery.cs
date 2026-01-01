
using MediatR;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Responses.Notifications;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Notifications.Queries.GetNotifications;

public sealed record GetNotificationsQuery(
    string? Cursor,
    int PageSize
) : IRequest<Result<CursorPagedResponse<NotificationResponse>>>;
