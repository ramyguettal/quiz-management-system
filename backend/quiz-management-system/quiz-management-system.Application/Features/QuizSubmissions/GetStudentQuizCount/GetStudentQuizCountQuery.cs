using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.QuizSubmissions.GetStudentQuizCount;

public sealed record GetStudentQuizCountQuery(Guid StudentId) : IRequest<Result<int>>;
