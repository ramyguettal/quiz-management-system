using Microsoft.AspNetCore.Http;

namespace quiz_management_system.Contracts.Requests.Files;

public record UploadImagesRequest(string EntityType, Guid EntityId, IFormFileCollection Images);
