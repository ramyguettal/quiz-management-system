using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Reponses.Quizzes;
using quiz_management_system.Contracts.Requests.Student;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder;
using quiz_management_system.Domain.QuizesFolder.Enums;

namespace quiz_management_system.Application.Features.Quizzes.GetAll;

public class GetQuizzesQueryHandler(IAppDbContext _context)
    : IRequestHandler<GetQuizzesQuery, Result<CursorPagedResponse<QuizListItemResponse>>>
{
    public async Task<Result<CursorPagedResponse<QuizListItemResponse>>> Handle(
        GetQuizzesQuery request,
        CancellationToken ct)
    {
        // Parse cursor (using CreatedAtUtc as cursor)
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

        // Build base query with projection to include question count
        var query = _context.Quizzes
            .AsNoTracking()
            .Include(q => q.Course)
                .ThenInclude(c => c.AcademicYear)
            .Include(q => q.Groups)
                .ThenInclude(qg => qg.Group)
            .Where(q => q.CreatedAtUtc < cursor);




        // Apply filters
        if (request.CourseId.HasValue)
            query = query.Where(q => q.CourseId == request.CourseId.Value);

        if (request.AcademicYearId.HasValue)
            query = query.Where(q => q.Course.AcademicYearId == request.AcademicYearId.Value);

        if (request.InstructorId.HasValue)
        {
            query = query.Where(q => _context.InstructorCourses
                .Any(ic => ic.InstructorId == request.InstructorId.Value && ic.CourseId == q.CourseId));
        }

        if (request.QuizStatus is not null)
        {
            query = query.Where(q => q.Status == request.QuizStatus);

        }
        if (request.TimeStatus is not null)
        {
            var now = DateTimeOffset.UtcNow;

            query = request.TimeStatus.Value switch
            {
                TimeQuizStatus.Upcoming =>
                    query.Where(q =>
                        q.AvailableFromUtc > now),

                TimeQuizStatus.Active =>
                    query.Where(q =>
                        q.Status == QuizStatus.Published &&
                        q.AvailableFromUtc <= now &&
                        (q.AvailableToUtc == null || q.AvailableToUtc > now)),

                TimeQuizStatus.Ended =>
                    query.Where(q =>
                        q.Status == QuizStatus.Closed ||
                        (q.AvailableToUtc != null && q.AvailableToUtc <= now)),

                _ => query
            };
        }


        // Project to include question count using Select
        var quizzesWithCount = await query
            .OrderByDescending(q => q.CreatedAtUtc)
            .ThenByDescending(q => q.Id)
            .Take(size)
            .Select(q => new
            {
                Quiz = q,
                QuestionCount = q.Questions.Count()
            })
            .ToListAsync(ct);

        // Handle empty results
        if (quizzesWithCount.Count == 0)
        {
            return Result.Success(
                new CursorPagedResponse<QuizListItemResponse>(
                    Items: Array.Empty<QuizListItemResponse>(),
                    NextCursor: null,
                    HasNextPage: false));
        }

        var instructorIds = quizzesWithCount
    .Select(x => x.Quiz.CreatedBy)
    .Where(id => id != Guid.Empty)
    .Distinct()
    .ToHashSet();
        var instructors = await _context.Instructors
    .Where(i => instructorIds.Contains(i.Id))
    .Select(i => new
    {
        i.Id,
        i.FullName
    })
    .ToDictionaryAsync(i => i.Id, i => i.FullName, ct);

        // Map to DTOs
        var dtos = quizzesWithCount.Select(x =>
        {
            instructors.TryGetValue(x.Quiz.CreatedBy, out var name);

            return MapToListItemDto(
                x.Quiz,
                x.QuestionCount,
                name
            );
        }).ToList();

        // Calculate next cursor
        string? nextCursor = quizzesWithCount.Count == size
            ? quizzesWithCount.Last().Quiz.CreatedAtUtc.ToString("o")
            : null;

        // Build response
        return Result.Success(
            new CursorPagedResponse<QuizListItemResponse>(
                Items: dtos,
                NextCursor: nextCursor,
                HasNextPage: nextCursor is not null));
    }

    private static QuizListItemResponse MapToListItemDto(Quiz quiz, int questionCount, string? instructorName)
    {
        return new QuizListItemResponse(
            Id: quiz.Id,
            Title: quiz.Title,
            Description: quiz.Description,
            CourseId: quiz.CourseId,
            CourseName: quiz.Course.Title,
            AcademicYearName: quiz.Course.AcademicYear?.Number,
            AvailableFromUtc: quiz.AvailableFromUtc,
            AvailableToUtc: quiz.AvailableToUtc,
            Status: quiz.Status,
            ResultsReleased: quiz.ResultsReleased,
            QuestionCount: questionCount,
            GroupCount: quiz.Groups.Count,
            Groups: quiz.Groups.Select(g => new GroupResponse(
                Id: g.GroupId,
                GroupNumber: g.Group.GroupNumber
            )).ToList(),
            CreatedAtUtc: quiz.CreatedAtUtc,
            LastModifiedUtc: quiz.LastModifiedUtc,
            InstructorName: instructorName

        );
    }
}