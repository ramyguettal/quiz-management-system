using MediatR;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Courses.Commands.UpdateCourse;

public record UpdateCourseCommand(
    Guid CourseId,
    Guid AcademicYearId,
    string Title,
    string Description,
    string Code
) : IRequest<Result<CourseResponse>>;