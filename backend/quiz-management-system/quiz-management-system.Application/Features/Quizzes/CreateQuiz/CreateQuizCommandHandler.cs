using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder;
using quiz_management_system.Domain.QuizesFolder.QuizGroupFolder;

namespace quiz_management_system.Application.Features.Quizzes.CreateQuiz;

public class CreateQuizCommandHandler(IAppDbContext _context) : IRequestHandler<CreateQuizCommand, Result<Guid>>
{




    public async Task<Result<Guid>> Handle(CreateQuizCommand request, CancellationToken ct)
    {
        // Load course
        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == request.CourseId, ct);

        if (course == null)
            return Result.Failure<Guid>(
                UserError.Unauthorized());

        // Create quiz using domain
        var quizResult = Quiz.Create(
            Guid.CreateVersion7(),
            course,
            request.Title,
            request.Description,
            request.AvailableFromUtc,
            request.AvailableToUtc,
            request.ShuffleQuestions,
            request.ShowResultsImmediately,
            request.AllowEditAfterSubmission
        );

        if (quizResult.IsFailure)
            return Result.Failure<Guid>(quizResult.TryGetError());

        var quiz = quizResult.TryGetValue();

        // Add groups
        IReadOnlyCollection<QuizGroup>? quizGroups = null; ;
        if (request.GroupIds?.Any() == true)
        {
            var groups = await _context.Groups
                .Where(g => request.GroupIds.Contains(g.Id))
                .ToListAsync(ct);


            Result<IReadOnlyCollection<QuizGroup>> quizGroupsResult = quiz.AddGroups(groups);
            if (quizGroupsResult.IsFailure)
                return Result.Failure<Guid>(quizGroupsResult.TryGetError());

            quizGroups = quizGroupsResult.TryGetValue();
        }

        _context.Quizzes.Add(quiz);
        if (quizGroups is not null)
            await _context.QuizGroups.AddRangeAsync(quizGroups);

        await _context.SaveChangesAsync(ct);

        return Result.Success(quiz.Id);
    }
}
