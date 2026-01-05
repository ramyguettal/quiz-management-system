using quiz_management_system.Domain.Common.ResultPattern.Result;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace quiz_management_system.Application.Features.FilesFolder.Commads.UploadImages;

public record UploadImagesCommand(
    string folder,
    string EntityType,
    Guid EntityId,
    IFormFileCollection Images) : IRequest<Result<IEnumerable<Guid>>>;
