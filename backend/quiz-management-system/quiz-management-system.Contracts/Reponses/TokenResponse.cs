namespace quiz_management_system.Contracts.Reponses;

/// <summary>
/// Represents a single token with its expiration timestamp.
/// </summary>
public sealed record TokenResponse(
    string Token,
    DateTime ExpiresAt);
