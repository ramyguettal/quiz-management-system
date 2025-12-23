using FluentValidation;

namespace quiz_management_system.Application.Features.CreateStudent;

public sealed class CreateStudentCommandValidator
    : AbstractValidator<CreateStudentCommand>
{
    private static readonly string[] ValidAcademicYears =
    {
        "Y1", "Y2", "Y3", "Y4"
    };

    private static readonly string[] ValidGroupNumbers =
    {
        "G1", "G2", "G3", "G4", "G5", "G6",
        "G7", "G8", "G9", "G10", "G11", "G12"
    };

    public CreateStudentCommandValidator()
    {
        RuleFor(command => command.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(command => command.FullName)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(command => command.AcademicYear)
            .NotEmpty()
            .Must(year => ValidAcademicYears.Contains(year))
            .WithMessage("AcademicYear must be between Y1 and Y4.");

        RuleFor(command => command.GroupNumber)
            .NotEmpty()
            .Must(group => ValidGroupNumbers.Contains(group))
            .WithMessage("GroupNumber must be between G1 and G12.");
    }
}
