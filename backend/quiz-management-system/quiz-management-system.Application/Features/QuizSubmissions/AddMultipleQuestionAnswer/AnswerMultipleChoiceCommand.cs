using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.QuizSubmissions.AddMultipleQuestionAnswer;

public record AnswerMultipleChoiceCommand(
    Guid SubmissionId,
    Guid QuestionId,
    List<Guid> SelectedOptionIds
) : IRequest<Result<Guid>>;
