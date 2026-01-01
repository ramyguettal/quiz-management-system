using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Reponses.Quizzes;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder;
using quiz_management_system.Domain.QuizesFolder.Enums;

namespace quiz_management_system.Application.Features.Quizzes.GetAll;

public record GetQuizzesQuery(
    Guid? CourseId,
    Guid? InstructorId,
    Guid? AcademicYearId,
    string? Status,
    string? Cursor,
    int PageSize
) : IRequest<Result<CursorPagedResponse<QuizListItemResponse>>>;

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

        // Build base query
        var query = _context.Quizzes
            .AsNoTracking()
            .Include(q => q.Course)
                .ThenInclude(c => c.AcademicYear)
            .Include(q => q.Groups)
                .ThenInclude(qg => qg.Group)
            .Where(q => q.CreatedAtUtc < cursor)
            .AsQueryable();

        // Apply filters
        if (request.CourseId.HasValue)
            query = query.Where(q => q.CourseId == request.CourseId.Value);

        if (request.AcademicYearId.HasValue)
            query = query.Where(q => q.Course.AcademicYearId == request.AcademicYearId.Value);

        if (request.InstructorId.HasValue)
        {
            query = query.Where(q => q.Groups.Any(qg =>
                qg.Group.Instructors.Any(gi => gi.InstructorId == request.InstructorId.Value)));
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (Enum.TryParse<QuizStatus>(request.Status, true, out var status))
                query = query.Where(q => q.Status == status);
        }

        // Apply cursor pagination
        var quizzes = await query
            .OrderByDescending(q => q.CreatedAtUtc)
            .ThenByDescending(q => q.Id)
            .Take(size)
            .ToListAsync(ct);

        // Handle empty results
        if (quizzes.Count == 0)
        {
            return Result.Success(
                new CursorPagedResponse<QuizListItemResponse>(
                    Items: Array.Empty<QuizListItemResponse>(),
                    NextCursor: null,
                    HasNextPage: false));
        }

        // Map to DTOs
        var dtos = quizzes.Select(MapToListItemDto).ToList();

        // Calculate next cursor
        string? nextCursor = quizzes.Count == size
            ? quizzes.Last().CreatedAtUtc.ToString("o")
            : null;

        // Build response
        return Result.Success(
            new CursorPagedResponse<QuizListItemResponse>(
                Items: dtos,
                NextCursor: nextCursor,
                HasNextPage: nextCursor is not null));
    }

    private static QuizListItemResponse MapToListItemDto(Quiz quiz)
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
            Status: quiz.Status.ToString(),
            ResultsReleased: quiz.ResultsReleased,
            QuestionCount: quiz.Questions?.Count ?? 0,
            GroupCount: quiz.Groups.Count,
            Groups: quiz.Groups.Select(g => new GroupResponse(
                Id: g.GroupId,
                GroupNumber: g.Group.GroupNumber
            )).ToList(),
            CreatedAtUtc: quiz.CreatedAtUtc,
            LastModifiedUtc: quiz.LastModifiedUtc
        );
    }
}