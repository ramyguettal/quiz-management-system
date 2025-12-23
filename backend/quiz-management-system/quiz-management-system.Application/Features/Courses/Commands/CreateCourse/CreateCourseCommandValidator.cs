using FluentValidation;

namespace quiz_management_system.Application.Features.Courses.Commands.CreateCourse;

public sealed class CreateCourseCommandValidator
    : AbstractValidator<CreateCourseCommand>
{
    public CreateCourseCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.AcademicYearId)
            .NotEmpty();
    }

}