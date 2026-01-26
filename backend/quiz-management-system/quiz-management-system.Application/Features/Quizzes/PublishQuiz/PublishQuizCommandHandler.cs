using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder;

namespace quiz_management_system.Application.Features.Quizzes.PublishQuiz;

public class PublishQuizCommandHandler(
    IAppDbContext _context,
    IActivityService activityService,
    IUserContext userContext) : IRequestHandler<PublishQuizCommand, Result>
{
    public async Task<Result> Handle(PublishQuizCommand request, CancellationToken ct)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .Include(q => q.Groups)
            .FirstOrDefaultAsync(q => q.Id == request.QuizId, ct);

        if (quiz == null)
            return Result.Failure(DomainError.NotFound(nameof(Quiz), request.QuizId));

        var result = quiz.Publish();
        if (result.IsFailure)
            return result;

        await _context.SaveChangesAsync(ct);

        // Log activity - performer name fetched automatically by ActivityService
        var performerId = userContext.UserId ?? Guid.Empty;
        await activityService.LogActivityAsync(
            ActivityType.QuizPublished,
            performerId,
            userContext.UserRole ?? "Instructor",
            $"published quiz '{quiz.Title}'",
            quiz.Id,
            "Quiz",
            quiz.Title,
            ct);

        return Result.Success();
    }
}
