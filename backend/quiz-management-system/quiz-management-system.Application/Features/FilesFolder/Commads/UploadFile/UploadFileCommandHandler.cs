
using MediatR;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Responses.Files;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.FilesFolder.Commads.UploadFile;

public class UploadFileCommandHandler(IFileService fileService)
    : IRequestHandler<UploadFileCommand, Result<UploadFileResponse>>
{
    public async Task<Result<UploadFileResponse>> Handle(UploadFileCommand request, CancellationToken ct)
    {
        Result<Guid> uploadResult = await fileService.UploadAsync(
             request.EntityType,
             request.EntityId,
             request.folder,
             request.File,
             ct);
        if (uploadResult.IsFailure)
            return Result.Failure<UploadFileResponse>(uploadResult.TryGetError());

        return Result.Success(new UploadFileResponse(uploadResult.TryGetValue()));


    }
}
