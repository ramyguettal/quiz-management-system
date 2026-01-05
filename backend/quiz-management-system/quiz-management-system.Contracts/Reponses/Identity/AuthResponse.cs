namespace quiz_management_system.Contracts.Reponses.Identity;

/// <summary>
/// Authentication result returned after login, register, or token refresh.
/// </summary>
public sealed record AuthResponse(
    string UserId,
    string Email,
    string FullName,
    string Role);

public sealed record AuthDto(
    string UserId,
    string Email,
    string FullName,
    string Role,
    TokenResponse JwtToken,
    TokenResponse RefreshToken);





