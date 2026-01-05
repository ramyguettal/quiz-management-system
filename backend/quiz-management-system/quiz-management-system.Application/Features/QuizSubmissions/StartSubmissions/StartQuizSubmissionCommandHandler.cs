using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder;
using quiz_management_system.Domain.Users.StudentsFolder;
using quiz_management_system.Domain.UserSubmission;

namespace quiz_management_system.Application.Features.QuizSubmissions.StartSubmissions;

public class StartQuizSubmissionCommandHandler(IAppDbContext _context)
    : IRequestHandler<StartQuizSubmissionCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(
        StartQuizSubmissionCommand request,
        CancellationToken ct)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == request.QuizId, ct);

        if (quiz == null)
            return Result.Failure<Guid>(DomainError.NotFound(nameof(Quiz), request.QuizId));

        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.Id == request.StudentId, ct);

        if (student == null)
            return Result.Failure<Guid>(DomainError.NotFound(nameof(Student), request.StudentId));

        // Check if student already has an in-progress submission
        var existingSubmission = await _context.QuizSubmissions
            .FirstOrDefaultAsync(
                s => s.QuizId == request.QuizId
                && s.StudentId == request.StudentId
                && s.Status == Domain.UserSubmission.Enums.SubmissionStatus.InProgress,
                ct);

        if (existingSubmission != null)
            return Result.Failure<Guid>(
                DomainError.InvalidState(nameof(QuizSubmission),
                    "Student already has an in-progress submission for this quiz."));

        var submissionResult = QuizSubmission.Create(
            Guid.CreateVersion7(),
            quiz,
            student);

        if (submissionResult.IsFailure)
            return Result.Failure<Guid>(submissionResult.TryGetError());

        var submission = submissionResult.TryGetValue();

        await _context.QuizSubmissions.AddAsync(submission, ct);
        await _context.SaveChangesAsync(ct);

        return Result.Success(submission.Id);
    }
}