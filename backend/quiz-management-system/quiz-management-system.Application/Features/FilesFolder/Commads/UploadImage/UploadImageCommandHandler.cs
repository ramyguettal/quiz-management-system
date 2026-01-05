using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Responses.Files;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace quiz_management_system.Application.Features.FilesFolder.Commads.UploadImage;

public class UploadImageCommandHandler(IFileService fileService, [FromKeyedServices("files")] IUrlBuilder fileUrlBuilder)
    : IRequestHandler<UploadImageCommand, Result<UploadImageResponse>>
{
    public async Task<Result<UploadImageResponse>> Handle(UploadImageCommand request, CancellationToken ct)
    {
        Result<Guid> uploadResult = await fileService.UploadImageAsync(
            request.EntityType,
            request.EntityId,
            request.folder,
            request.Image,
            false, ct);
        if (uploadResult.IsFailure)
            return Result.Failure<UploadImageResponse>(uploadResult.TryGetError());

        Guid fileId = uploadResult.TryGetValue();
        return Result.Success(new UploadImageResponse(fileId, fileUrlBuilder.GetUrl(fileId)!));
    }
}