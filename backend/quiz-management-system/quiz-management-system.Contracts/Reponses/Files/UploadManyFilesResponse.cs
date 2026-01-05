namespace quiz_management_system.Contracts.Responses.Files;

public record UploadManyFilesResponse(int Count, List<Guid> FileIds);
