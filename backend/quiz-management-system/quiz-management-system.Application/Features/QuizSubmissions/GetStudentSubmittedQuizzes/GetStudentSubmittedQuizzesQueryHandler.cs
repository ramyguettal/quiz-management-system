using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Reponses.QuizSubmissions;
using quiz_management_system.Contracts.Requests.UserSubmissions;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder.Enums;
using quiz_management_system.Domain.UserSubmission.Enums;

namespace quiz_management_system.Application.Features.QuizSubmissions.GetStudentSubmittedQuizzes;

public sealed class GetStudentSubmittedQuizzesQueryHandler(IAppDbContext _context)
    : IRequestHandler<GetStudentSubmittedQuizzesQuery, Result<CursorPagedResponse<StudentSubmittedQuizResponse>>>
{
    public async Task<Result<CursorPagedResponse<StudentSubmittedQuizResponse>>> Handle(
        GetStudentSubmittedQuizzesQuery request,
        CancellationToken ct)
    {
        // Parse cursor (using StartedAtUtc as cursor for consistent ordering)
        DateTimeOffset cursor;
        if (string.IsNullOrWhiteSpace(request.Cursor))
        {
            cursor = DateTimeOffset.UtcNow;
        }
        else if (!DateTimeOffset.TryParse(request.Cursor, out cursor))
        {
            cursor = DateTimeOffset.UtcNow;
        }

        // Validate and set page size (max 50)
        int size = request.PageSize is <= 0 or > 50 ? 20 : request.PageSize;

        // Build base query for student's submissions
        var query = _context.QuizSubmissions
            .AsNoTracking()
            .Include(s => s.Quiz)
                .ThenInclude(q => q.Course)
            .Where(s => s.StudentId == request.StudentId)
            .Where(s => s.StartedAtUtc < cursor);

        // Apply status filter
        if (request.Status.HasValue)
        {
            query = request.Status.Value switch
            {
                SubmissionStatusFilter.InProgress => query.Where(s => s.Status == SubmissionStatus.InProgress),
                SubmissionStatusFilter.Submitted => query.Where(s => s.Status == SubmissionStatus.Submitted && s.Quiz.Status != QuizStatus.Closed),
                SubmissionStatusFilter.Released => query.Where(s => s.Status == SubmissionStatus.Submitted && s.Quiz.Status == QuizStatus.Closed),
                _ => query
            };
        }

        // Apply course filter
        if (request.CourseId.HasValue)
        {
            query = query.Where(s => s.Quiz.CourseId == request.CourseId.Value);
        }

        // Execute query with projection
        var submissions = await query
            .OrderByDescending(s => s.StartedAtUtc)
            .ThenByDescending(s => s.Id)
            .Take(size)
            .Select(s => new
            {
                s.Id,
                s.QuizId,
                s.Quiz.Title,
                CourseName = s.Quiz.Course.Title,
                QuizCreatedBy = s.Quiz.CreatedBy, // Instructor who created the quiz
                s.Quiz.AvailableFromUtc,
                s.Quiz.AvailableToUtc,
                s.SubmittedAtUtc,
                s.StartedAtUtc,
                s.Status,
                IsReleased = s.Quiz.Status == QuizStatus.Closed,
                s.ScaledScore,
                s.Percentage
            })
            .ToListAsync(ct);

        // Handle empty results
        if (submissions.Count == 0)
        {
            return Result.Success(
                new CursorPagedResponse<StudentSubmittedQuizResponse>(
                    Items: Array.Empty<StudentSubmittedQuizResponse>(),
                    NextCursor: null,
                    HasNextPage: false));
        }

        // Lookup instructor names (using Quiz.CreatedBy)
        var instructorIds = submissions
            .Select(s => s.QuizCreatedBy)
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToHashSet();

        var instructors = await _context.Instructors
            .Where(i => instructorIds.Contains(i.Id))
            .Select(i => new { i.Id, i.FullName })
            .ToDictionaryAsync(i => i.Id, i => i.FullName, ct);

        // Map to response DTOs
        var dtos = submissions.Select(s =>
        {
            instructors.TryGetValue(s.QuizCreatedBy, out var instructorName);

            // Determine submission status filter value
            var statusFilter = s.Status == SubmissionStatus.InProgress
                ? SubmissionStatusFilter.InProgress
                : s.IsReleased 
                    ? SubmissionStatusFilter.Released 
                    : SubmissionStatusFilter.Submitted;

            return new StudentSubmittedQuizResponse(
                SubmissionId: s.Id,
                QuizId: s.QuizId,
                QuizTitle: s.Title,
                CourseName: s.CourseName,
                InstructorName: instructorName,
                AvailableFromUtc: s.AvailableFromUtc,
                AvailableToUtc: s.AvailableToUtc,
                SubmittedAtUtc: s.SubmittedAtUtc,
                StartedAtUtc: s.StartedAtUtc,
                Status: statusFilter,
                IsReleased: s.IsReleased,
                ScaledScore: s.IsReleased ? s.ScaledScore : null,
                Percentage: s.IsReleased ? s.Percentage : null
            );
        }).ToList();

        // Calculate next cursor (using StartedAtUtc for consistent pagination)
        string? nextCursor = submissions.Count == size
            ? submissions.Last().StartedAtUtc.ToString("o")
            : null;

        return Result.Success(
            new CursorPagedResponse<StudentSubmittedQuizResponse>(
                Items: dtos,
                NextCursor: nextCursor,
                HasNextPage: nextCursor is not null));
    }
}
