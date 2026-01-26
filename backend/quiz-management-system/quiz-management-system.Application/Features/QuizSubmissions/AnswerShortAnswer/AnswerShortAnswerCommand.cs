using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.QuizSubmissions.AnswerShortAnswer;

public record AnswerShortAnswerCommand(
    Guid SubmissionId,
    Guid QuestionId,
    string AnswerText
) : IRequest<Result<Guid>>;
