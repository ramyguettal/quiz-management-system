namespace quiz_management_system.Contracts.Requests.Admin;

public sealed record CreateAdminRequest(
    string Email,
    string FullName
);