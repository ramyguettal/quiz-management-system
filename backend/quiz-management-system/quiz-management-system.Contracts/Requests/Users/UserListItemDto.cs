using quiz_management_system.Domain.Users.Abstraction;
using quiz_management_system.Domain.Users.StudentsFolder.Enums;

namespace quiz_management_system.Contracts.Requests.Users;

public sealed record UserListItemDto(
    Guid Id,
    string FullName,
    string Email,
    Role Role,
    UserStatus Status
);