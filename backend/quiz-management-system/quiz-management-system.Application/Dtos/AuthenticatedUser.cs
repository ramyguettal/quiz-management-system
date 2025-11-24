namespace quiz_management_system.Application.Dtos;

public record AuthenticatedUser(string Id, string Email, string FullName, string Role);
