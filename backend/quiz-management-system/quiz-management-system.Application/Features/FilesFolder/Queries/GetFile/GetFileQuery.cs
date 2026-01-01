using quiz_management_system.Application.Features.FilesFolder.Dtos;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using MediatR;

namespace quiz_management_system.Application.Features.FilesFolder.Queries.GetFile;

public record GetFileQuery(Guid Id) : IRequest<Result<FileDto>>;
