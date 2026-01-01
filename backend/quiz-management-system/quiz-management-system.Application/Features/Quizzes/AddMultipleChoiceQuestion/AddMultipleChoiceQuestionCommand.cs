using MediatR;
using quiz_management_system.Contracts.Requests.Quiz.Questions;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Quizzes.AddMultipleChoiceQuestion;

public record AddMultipleChoiceQuestionCommand(
    Guid QuizId,
    string Text,
    int Points,
    bool IsTimed,
    int? TimeLimitInMinutes,
    bool ShuffleOptions,
    List<QuestionOptionDto> Options
) : IRequest<Result<Guid>>;
