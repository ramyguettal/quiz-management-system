using FluentValidation;

namespace quiz_management_system.Application.Features.Courses.Commands.UpdateCourse;

public sealed class UpdateCourseCommandValidator
    : AbstractValidator<UpdateCourseCommand>
{
    public UpdateCourseCommandValidator()
    {
        RuleFor(x => x.CourseId)
            .NotEmpty();

        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.AcademicYearId)
            .NotEmpty();
    }
}