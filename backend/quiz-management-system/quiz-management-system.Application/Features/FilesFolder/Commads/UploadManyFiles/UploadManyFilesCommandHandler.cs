using MediatR;
using quiz_management_system.Application.Features.FilesFolder.Commads.UploadManyFiles;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Responses.Files;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.FilesFolder.Commads.UploadFile;

public class UploadManyFilesCommandHandler(IFileService fileService)
    : IRequestHandler<UploadManyFilesCommand, Result<UploadManyFilesResponse>>
{
    public async Task<Result<UploadManyFilesResponse>> Handle(UploadManyFilesCommand request, CancellationToken ct)
    {
        var uploadResult = await fileService.UploadManyAsync(

             request.EntityType,
             request.EntityId,
             request.folder,
             request.Files,
             ct);
        if (uploadResult.IsFailure)
            return Result.Failure<UploadManyFilesResponse>(uploadResult.TryGetError());
        IEnumerable<Guid> value = uploadResult.TryGetValue();

        return Result.Success(new UploadManyFilesResponse(value.Count(), value.ToList()));

    }
}
