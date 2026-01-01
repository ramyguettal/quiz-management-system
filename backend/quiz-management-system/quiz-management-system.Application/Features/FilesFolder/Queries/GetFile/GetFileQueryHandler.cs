using MediatR;
using quiz_management_system.Application.Features.FilesFolder.Dtos;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.FilesFolder.Queries.GetFile;

public class GetFileQueryHandler(IFileService fileService)
    : IRequestHandler<GetFileQuery, Result<FileDto>>
{
    public async Task<Result<FileDto>> Handle(GetFileQuery request, CancellationToken ct)

    => await fileService.DownloadAsync(request.Id, ct);




}
