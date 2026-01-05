using FluentValidation;

namespace quiz_management_system.Application.Features.FilesFolder.Queries.GetFile;

public class GetFileQueryValidator : AbstractValidator<GetFileQuery>
{
    public GetFileQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEqual(Guid.Empty)
            .WithMessage("File ID is required.");
    }
}
