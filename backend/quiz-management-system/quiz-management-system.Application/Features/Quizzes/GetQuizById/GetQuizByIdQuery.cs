using MediatR;
using quiz_management_system.Contracts.Reponses.Quizzes;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Quizzes.GetQuizById;

public record GetQuizByIdQuery(Guid QuizId) : IRequest<Result<QuizResponse>>;
