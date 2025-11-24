namespace quiz_management_system.Application.Dtos;

public sealed record IdentityRegistrationResult(
    string IdentityUserId,
    string FullName,
    string Email,
    string Role
);
