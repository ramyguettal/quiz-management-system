using FluentValidation;
using Makayen.Application.Constans;
using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.UpdatePassword;

public record UpdatePasswordCommand(string UserId, string CurrentPassword, string NewPassword, string UserIpAddress) : IRequest<Result>;



public sealed class UpdatePasswordCommandValidator
    : AbstractValidator<UpdatePasswordCommand>
{
    public UpdatePasswordCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage(ValidationMessages.Required);

        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage(ValidationMessages.Required)
            .Matches(ValidationPatterns.StrongPassword).WithMessage(ValidationMessages.WeakPassword);

        RuleFor(x => x.NewPassword)
             .NotEmpty().WithMessage(ValidationMessages.Required)
            .Matches(ValidationPatterns.StrongPassword).WithMessage(ValidationMessages.WeakPassword)
            .NotEqual(x => x.CurrentPassword)
            .WithMessage("New password cannot be the same as the current password.");

        RuleFor(x => x.UserIpAddress)
            .NotEmpty().WithMessage("User IP Address is required.");
    }
}