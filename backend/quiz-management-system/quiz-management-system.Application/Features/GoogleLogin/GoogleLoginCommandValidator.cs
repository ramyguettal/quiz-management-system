using FluentValidation;

namespace quiz_management_system.Application.Features.GoogleLogin;

public sealed class GoogleLoginCommandValidator
    : AbstractValidator<GoogleLoginCommand>
{
    public GoogleLoginCommandValidator()
    {
        RuleFor(x => x.DeviceId)
            .NotEmpty()
            .WithMessage("DeviceId is required.")
            .MaximumLength(128);
    }
}