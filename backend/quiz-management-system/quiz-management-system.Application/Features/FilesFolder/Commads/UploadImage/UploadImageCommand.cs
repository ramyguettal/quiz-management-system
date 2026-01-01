using quiz_management_system.Contracts.Responses.Files;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace quiz_management_system.Application.Features.FilesFolder.Commads.UploadImage;

public record UploadImageCommand(
    string EntityType,
    Guid EntityId,
    string folder,
    IFormFile Image) : IRequest<Result<UploadImageResponse>>;
