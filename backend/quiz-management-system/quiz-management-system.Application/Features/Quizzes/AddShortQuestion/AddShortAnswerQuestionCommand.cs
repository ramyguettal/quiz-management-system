using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Quizzes.AddShortQuestion;

public record AddShortAnswerQuestionCommand(
    Guid QuizId,
    string Text,
    int Points,
    bool IsTimed,
    int? TimeLimitInMinutes,
    string? ExpectedAnswer
) : IRequest<Result<Guid>>;
