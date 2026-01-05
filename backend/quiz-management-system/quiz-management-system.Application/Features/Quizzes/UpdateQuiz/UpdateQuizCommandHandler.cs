using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder;
using quiz_management_system.Domain.QuizesFolder.QuizGroupFolder;

namespace quiz_management_system.Application.Features.Quizzes.UpdateQuiz;

public class UpdateQuizCommandHandler(IAppDbContext _context)
    : IRequestHandler<UpdateQuizCommand, Result>
{
    public async Task<Result> Handle(UpdateQuizCommand request, CancellationToken ct)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Groups)
            .FirstOrDefaultAsync(q => q.Id == request.QuizId, ct);

        if (quiz == null)
            return Result.Failure(DomainError.NotFound(nameof(Quiz), request.QuizId));

        // Update basic info
        var updateResult = quiz.UpdateBasicInfo(request.Title, request.Description);
        if (updateResult.IsFailure)
            return updateResult;

        // Update availability
        var availabilityResult = quiz.UpdateAvailability(
            request.AvailableFromUtc,
            request.AvailableToUtc);
        if (availabilityResult.IsFailure)
            return availabilityResult;

        // Update settings
        quiz.SetShuffleQuestions(request.ShuffleQuestions);
        if (request.ShowResultsImmediately)
            quiz.EnableImmediateResults();
        else
            quiz.DisableImmediateResults();
        quiz.SetAllowEditAfterSubmission(request.AllowEditAfterSubmission);

        // --- Groups upsert ---
        var existingGroupIds = quiz.Groups.Select(g => g.GroupId).ToList();
        var requestedGroupIds = request.GroupIds ?? new List<Guid>();

        // 1️⃣ Delete removed groups directly in DB
        var groupIdsToRemove = existingGroupIds.Except(requestedGroupIds).ToList();
        if (groupIdsToRemove.Any())
        {
            await _context.QuizGroups
                .Where(qg => qg.QuizId == quiz.Id && groupIdsToRemove.Contains(qg.GroupId))
                .ExecuteDeleteAsync(ct); // Direct DB deletion
        }

        // 2️⃣ Add new groups using domain logic
        var groupIdsToAdd = requestedGroupIds.Except(existingGroupIds).ToList();
        if (groupIdsToAdd.Any())
        {
            var groupsToAdd = await _context.Groups
                .Where(g => groupIdsToAdd.Contains(g.Id))
                .ToListAsync(ct);


            Result<IReadOnlyCollection<QuizGroup>> quizGroupsResult = quiz.AddGroups(groupsToAdd);
            if (quizGroupsResult.IsFailure)
                return Result.Failure<Guid>(quizGroupsResult.TryGetError());
            await _context.QuizGroups.AddRangeAsync(quizGroupsResult.TryGetValue());


        }

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}