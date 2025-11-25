namespace quiz_management_system.Contracts.Reponses.Identity;

public sealed record TokenResponse(
    string Token,
    DateTime ExpiresAt);
