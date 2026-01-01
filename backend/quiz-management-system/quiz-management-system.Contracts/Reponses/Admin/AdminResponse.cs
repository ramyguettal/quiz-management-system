namespace quiz_management_system.Contracts.Reponses.Admin;

public sealed record AdminResponse(
    Guid Id,
    string FullName,
    string Email
);
