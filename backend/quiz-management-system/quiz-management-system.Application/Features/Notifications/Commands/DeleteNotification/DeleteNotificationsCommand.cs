using quiz_management_system.Domain.Common.ResultPattern.Result;
using MediatR;

namespace quiz_management_system.Application.Features.Notifications.Commands.DeleteNotification;



public sealed record DeleteNotificationsCommand(
    IReadOnlyCollection<Guid> NotificationIds)
    : IRequest<Result>;