using Microsoft.AspNetCore.Http;

namespace quiz_management_system.Contracts.Requests.Files;

public record UploadFileRequest(string EntityType, Guid EntityId, IFormFile File);
