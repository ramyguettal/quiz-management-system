using quiz_management_system.Domain.Common;

namespace quiz_management_system.Domain.Events;

public sealed record QuizSubmissionSubmittedEvent(
    Guid SubmissionId,
    Guid QuizId,
    Guid StudentId) : DomainEvent;

