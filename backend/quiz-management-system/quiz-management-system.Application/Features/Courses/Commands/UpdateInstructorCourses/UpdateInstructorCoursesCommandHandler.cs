using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.InstructorsFolders;

namespace quiz_management_system.Application.Features.Courses.Commands.UpdateInstructorCourses;

public sealed class UpdateInstructorCoursesCommandHandler(
    IAppDbContext db,
    IActivityService activityService,
    IUserContext userContext)
    : IRequestHandler<UpdateInstructorCoursesCommand, Result<IReadOnlyList<CourseResponse>>>
{
    public async Task<Result<IReadOnlyList<CourseResponse>>> Handle(
        UpdateInstructorCoursesCommand request,
        CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(ct);

        try
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

            await transaction.CommitAsync(ct);

            // Log activity - performer name fetched automatically by ActivityService
            var performerId = userContext.UserId ?? Guid.Empty;
            await activityService.LogActivityAsync(
                ActivityType.InstructorCoursesUpdated,
                performerId,
                userContext.UserRole ?? "Admin",
                $"assigned {updatedCourses.Count} course(s) to instructor {instructor.FullName}",
                instructor.Id,
                "Instructor",
                instructor.FullName,
                ct);

            return Result.Success<IReadOnlyList<CourseResponse>>(updatedCourses);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }
}
