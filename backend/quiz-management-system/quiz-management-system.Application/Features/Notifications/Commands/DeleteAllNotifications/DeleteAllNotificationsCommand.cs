using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Notifications.Commands.DeleteAllNotifications;

public sealed record DeleteAllNotificationsCommand
    : IRequest<Result>;
