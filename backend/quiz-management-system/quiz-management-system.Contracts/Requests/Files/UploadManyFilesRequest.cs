using Microsoft.AspNetCore.Http;

namespace quiz_management_system.Contracts.Requests.Files;

public record UploadManyFilesRequest(string EntityType, Guid EntityId, IFormFileCollection Files);
