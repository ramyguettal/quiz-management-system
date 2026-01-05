using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Courses.Queries.GetCourseById;

public sealed record GetCourseByIdQuery(Guid CourseId)
    : IRequest<Result<CourseResponse>>;



public sealed class GetCourseByIdQueryHandler
    : IRequestHandler<GetCourseByIdQuery, Result<CourseResponse>>
{
    private readonly IAppDbContext context;

    public GetCourseByIdQueryHandler(IAppDbContext context)
    {
        this.context = context;
    }

    public async Task<Result<CourseResponse>> Handle(
        GetCourseByIdQuery request,
        CancellationToken cancellationToken)
    {
        CourseResponse? course = await context.Courses
            .AsNoTracking()
            .Include(c => c.AcademicYear)
            .Where(c => c.Id == request.CourseId)
            .Select(c => new CourseResponse(
                c.Id,
                c.AcademicYearId,
                c.Title,
                c.Description,
                c.Code,
                c.AcademicYear.Number
            ))
            .FirstOrDefaultAsync(cancellationToken);

        if (course is null)
        {
            return Result.Failure<CourseResponse>(
                DomainError.NotFound("Course", request.CourseId));
        }

        return Result.Success(course);
    }
}