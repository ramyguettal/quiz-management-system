using quiz_management_system.Contracts.Responses.Files;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace quiz_management_system.Application.Features.FilesFolder.Commads.UploadManyFiles;

public record UploadManyFilesCommand(
    string folder,
    string EntityType,
    Guid EntityId,
    IFormFileCollection Files) : IRequest<Result<UploadManyFilesResponse>>;
