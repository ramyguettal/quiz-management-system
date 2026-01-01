using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Quizzes.DeleteQuestion;

public record DeleteQuestionCommand(Guid QuestionId) : IRequest<Result>;


