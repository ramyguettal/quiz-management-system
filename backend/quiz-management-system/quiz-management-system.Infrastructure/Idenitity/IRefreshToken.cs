using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Domain.Common.Identity;

public interface IRefreshToken
{
    DateTimeOffset CreatedAt { get; }
    DateTimeOffset ExpiresAt { get; }
    string IdentityId { get; }
    bool IsActive { get; }
    bool IsExpired { get; }
    bool IsRevoked { get; }
    DateTimeOffset? RevokedAt { get; }
    string Token { get; }

    static abstract Result<RefreshToken> Create(string token, string userId, TimeSpan lifetime);
    Result Revoke();
}
