using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Quizzes.UpdateShortAnswerQuestion;

public record UpdateShortAnswerQuestionCommand(
    Guid QuestionId,
    string Text,
    int Points,

    string? ExpectedAnswer
) : IRequest<Result>;
