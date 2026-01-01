using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Common.Errors;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Quizzes.DeleteQuiz;

public sealed class DeleteQuizCommandHandler(IAppDbContext _context)
    : IRequestHandler<DeleteQuizCommand, Result>
{
    public async Task<Result> Handle(
        DeleteQuizCommand request,
        CancellationToken ct)
    {
        // Find the quiz
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .Include(q => q.Groups)
            .Include(q => q.Submissions)
            .FirstOrDefaultAsync(q => q.Id == request.QuizId, ct);

        if (quiz is null)
        {
            return Result.Failure(QuizErrors.NotFound(request.QuizId));
        }

        // Optional: Check if quiz has submissions
        if (quiz.Submissions.Any())
        {
            return Result.Failure(QuizErrors.HasSubmissions());
        }



        _context.QuizQuestions.RemoveRange(quiz.Questions);

        _context.QuizGroups.RemoveRange(quiz.Groups);

        // Remove the quiz
        _context.Quizzes.Remove(quiz);

        // Save changes
        await _context.SaveChangesAsync(ct);

        return Result.Success();
    }
}


