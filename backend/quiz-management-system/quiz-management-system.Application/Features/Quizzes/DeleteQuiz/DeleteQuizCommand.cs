using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Quizzes.DeleteQuiz;

public sealed record DeleteQuizCommand(Guid QuizId) : IRequest<Result>;


