using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Quizzes.CreateQuiz;

public record CreateQuizCommand(
    Guid CourseId,
    string Title,
    string Description,
    DateTimeOffset AvailableFromUtc,
    DateTimeOffset? AvailableToUtc,
    bool ShuffleQuestions,
    bool ShowResultsImmediately,
    bool AllowEditAfterSubmission,
    List<Guid> GroupIds
) : IRequest<Result<Guid>>;
