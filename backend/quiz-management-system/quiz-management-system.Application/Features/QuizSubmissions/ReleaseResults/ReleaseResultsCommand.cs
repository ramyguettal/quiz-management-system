using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.QuizSubmissions.ReleaseResults;

public record ReleaseResultsCommand(
    Guid QuizId
) : IRequest<Result>;
