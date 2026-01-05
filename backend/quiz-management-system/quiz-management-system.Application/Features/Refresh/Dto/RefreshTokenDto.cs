namespace quiz_management_system.Application.Features.Refresh.Dto;

public record RefreshTokenDto(
    string Token,
    DateTimeOffset CreatedAt,
    DateTimeOffset ExpiresAt,
    bool IsRevoked
);