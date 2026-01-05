namespace quiz_management_system.Contracts.Responses.Files;

public record UploadImagesResponse(int Count, List<Guid> ImageIds, List<string> ImageUrls);
