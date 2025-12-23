using MediatR;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Courses.Commands.UpdateCourse;

public sealed record UpdateCourseCommand(
    Guid CourseId,
    string Title,
    Guid AcademicYearId
) : IRequest<Result<CourseResponse>>;
