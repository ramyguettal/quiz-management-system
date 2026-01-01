using Files.Contracts.Common;
using FluentValidation;
using quiz_management_system.Application.Features.FilesFolder.Settings;

namespace quiz_management_system.Application.Features.FilesFolder.Commads.UploadFile;

public class UploadFileCommandValidator : AbstractValidator<UploadFileCommand>
{
    public UploadFileCommandValidator()
    {
        // Validate EntityType
        RuleFor(x => x.EntityType)
            .NotEmpty()
            .WithMessage("EntityType is required.")
            .MaximumLength(FileSettings.MaxEntityTypeLength)
            .WithMessage($"EntityType cannot exceed {FileSettings.MaxEntityTypeLength} characters.");

        // Validate EntityId
        RuleFor(x => x.EntityId)
            .NotEqual(Guid.Empty)
            .WithMessage("EntityId is required.");

        // Validate File - using reusable validators
        RuleFor(x => x.File)
            .SetValidator(new FileNotEmptyValidator())
            .SetValidator(new FileSizeValidator())
            .SetValidator(new FileNameValidator())
            .SetValidator(new FileSignatureValidator());
    }
}
