using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.InstructorsFolders;

namespace quiz_management_system.Application.Features.Courses.Commands.UpdateInstructorCourses;

public sealed record UpdateInstructorCoursesCommand(
    Guid InstructorId,
    IReadOnlyList<Guid> CourseIds
) : IRequest<Result<IReadOnlyList<CourseResponse>>>;


public sealed class UpdateInstructorCoursesCommandHandler
    : IRequestHandler<UpdateInstructorCoursesCommand, Result<IReadOnlyList<CourseResponse>>>
{
    private readonly IAppDbContext db;

    public UpdateInstructorCoursesCommandHandler(IAppDbContext db)
    {
        this.db = db;
    }

    public async Task<Result<IReadOnlyList<CourseResponse>>> Handle(
        UpdateInstructorCoursesCommand request,
        CancellationToken ct)
    {

        Instructor? instructor = await db.Instructors
            .FirstOrDefaultAsync(i => i.Id == request.InstructorId, ct);

        if (instructor is null)
        {
            return Result.Failure<IReadOnlyList<CourseResponse>>(
                UserError.NotFound("Instructor not found."));
        }


        await db.InstructorCourses
            .Where(ic =>
                ic.InstructorId == request.InstructorId &&
                !request.CourseIds.Contains(ic.CourseId))
            .ExecuteDeleteAsync(ct);


        var existingCourseIds = await db.InstructorCourses
            .Where(ic => ic.InstructorId == request.InstructorId)
            .Select(ic => ic.CourseId)
            .ToListAsync(ct);

        var newCourseIds = request.CourseIds
            .Where(id => !existingCourseIds.Contains(id))
            .ToList();


        if (newCourseIds.Count > 0)
        {
            var coursesToAdd = await db.Courses
                .Where(c => newCourseIds.Contains(c.Id))
                .ToListAsync(ct);

            var instructorCourses = coursesToAdd
                .Select(course => InstructorCourse.Create(instructor, course))
                .ToList();

            db.InstructorCourses.AddRange(instructorCourses);
        }

        await db.SaveChangesAsync(ct);


        var updatedCourses = await db.InstructorCourses
            .AsNoTracking()
            .Where(ic => ic.InstructorId == request.InstructorId)
            .Select(ic => new CourseResponse(
                ic.Course.Id,
                ic.Course.AcademicYearId,
                ic.Course.Title,
                ic.Course.Description,
                ic.Course.Code,
                ic.Course.AcademicYear.Number

            ))
            .ToListAsync(ct);

        return Result.Success<IReadOnlyList<CourseResponse>>(updatedCourses);
    }
}
