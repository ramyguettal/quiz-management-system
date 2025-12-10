namespace quiz_management_system.Application.Dtos;

public record AuthenticatedUser(Guid Id, string Email, string FullName, string Role);
