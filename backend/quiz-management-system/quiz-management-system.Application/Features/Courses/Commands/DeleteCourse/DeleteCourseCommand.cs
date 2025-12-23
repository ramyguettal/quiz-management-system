using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Courses.Commands.DeleteCourse;

public sealed record DeleteCourseCommand(
    Guid CourseId
) : IRequest<Result>;
