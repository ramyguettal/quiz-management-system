namespace quiz_management_system.Application.Features.FilesFolder.Dtos;

public record FileDto(byte[] Content, string ContentType, string FileName);
