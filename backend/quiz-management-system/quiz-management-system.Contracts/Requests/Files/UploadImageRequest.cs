using Microsoft.AspNetCore.Http;

namespace quiz_management_system.Contracts.Requests.Files;

public record UploadImageRequest(string EntityType, Guid EntityId, IFormFile Image);