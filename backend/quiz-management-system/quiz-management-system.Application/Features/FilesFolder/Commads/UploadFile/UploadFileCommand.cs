using MediatR;
using Microsoft.AspNetCore.Http;
using quiz_management_system.Contracts.Responses.Files;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.FilesFolder.Commads.UploadFile;

public record UploadFileCommand(
    string folder,
    string EntityType,
    Guid EntityId,
    IFormFile File) : IRequest<Result<UploadFileResponse>>;
