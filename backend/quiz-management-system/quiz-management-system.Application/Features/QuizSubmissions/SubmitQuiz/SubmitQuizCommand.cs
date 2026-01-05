using MediatR;
using quiz_management_system.Contracts.Reponses.QuizSubmissions;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.QuizSubmissions.SubmitQuiz;

public record SubmitQuizCommand(
    Guid SubmissionId
) : IRequest<Result<UserSubmittedResponse>>;
