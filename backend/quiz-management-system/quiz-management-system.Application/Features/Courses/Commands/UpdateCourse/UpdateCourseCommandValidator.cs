using FluentValidation;
using quiz_management_system.Application.Features.Courses.Commands.UpdateCourse;

public class UpdateCourseCommandValidator : AbstractValidator<UpdateCourseCommand>
{
    public UpdateCourseCommandValidator()
    {
        RuleFor(x => x.CourseId)
            .NotEmpty()
            .WithMessage("Course ID is required.");

        RuleFor(x => x.AcademicYearId)
            .NotEmpty()
            .WithMessage("Academic Year ID is required.");

        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Course title is required.")
            .MaximumLength(200)
            .WithMessage("Course title cannot exceed 200 characters.");

        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Course code is required.")
            .MaximumLength(20)
            .WithMessage("Course code cannot exceed 20 characters.")
            .Matches("^[A-Z0-9-]+$")
            .WithMessage("Course code must contain only uppercase letters, numbers, and hyphens.");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.");
    }
}