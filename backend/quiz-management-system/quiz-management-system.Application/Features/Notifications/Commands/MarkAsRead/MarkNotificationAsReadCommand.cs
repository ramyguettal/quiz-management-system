using quiz_management_system.Domain.Common.ResultPattern.Result;
using MediatR;

namespace quiz_management_system.Application.Features.Notifications.Commands.MarkAsRead;

public sealed record MarkNotificationAsReadCommand(Guid NotificationId) : IRequest<Result>;
