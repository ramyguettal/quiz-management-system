using quiz_management_system.Domain.Common;

namespace quiz_management_system.Domain.Events;

public sealed record QuizPublishedEvent(Guid QuizId) : DomainEvent;
