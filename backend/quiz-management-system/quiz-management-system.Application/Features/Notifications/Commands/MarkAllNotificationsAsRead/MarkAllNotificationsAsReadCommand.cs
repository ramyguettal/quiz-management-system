using quiz_management_system.Domain.Common.ResultPattern.Result;
using MediatR;

namespace quiz_management_system.Application.Features.Notifications.Commands.MarkAllNotificationsAsRead;


public sealed record MarkAllNotificationsAsReadCommand
    : IRequest<Result>;
