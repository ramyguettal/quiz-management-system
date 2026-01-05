using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Quizzes.PublishQuiz;

public record PublishQuizCommand(Guid QuizId) : IRequest<Result>;
