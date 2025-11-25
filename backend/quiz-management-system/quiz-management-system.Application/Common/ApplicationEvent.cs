using MediatR;

namespace quiz_management_system.Application.Common;

public record ApplicationEvent() : INotification;
