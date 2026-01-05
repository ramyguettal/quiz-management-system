using MediatR;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.FilesFolder.Commads.UploadImages;

public class UploadImagesCommandHandler(IFileService fileService)
    : IRequestHandler<UploadImagesCommand, Result<IEnumerable<Guid>>>
{
    public async Task<Result<IEnumerable<Guid>>> Handle(UploadImagesCommand request, CancellationToken ct)
    {
        return await fileService.UploadManyAsync(
            request.EntityType,
            request.EntityId,
            request.folder,
            request.Images,
             ct);
    }
}