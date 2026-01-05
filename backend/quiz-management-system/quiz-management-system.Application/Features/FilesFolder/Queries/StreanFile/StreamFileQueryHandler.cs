using MediatR;
using quiz_management_system.Application.Features.FilesFolder.Dtos;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.FilesFolder.Queries.StreanFile;

public class StreamFileQueryHandler(IFileService fileService)
    : IRequestHandler<StreamFileQuery, Result<StreamFileDto>>
{
    public async Task<Result<StreamFileDto>> Handle(StreamFileQuery request, CancellationToken ct)
   => await fileService.StreamAsync(request.Id, ct);


}