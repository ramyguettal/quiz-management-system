using Dodo.Primitives;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;


namespace quiz_management_system.Domain.Common.Identity
{
    public sealed class RefreshToken : Entity, IRefreshToken
    {
        public string Token { get; private set; } = string.Empty;
        public string IdentityId { get; private set; } = string.Empty;

        public DateTimeOffset CreatedAt { get; private set; }
        public DateTimeOffset ExpiresAt { get; private set; }
        public DateTimeOffset? RevokedAt { get; private set; }

        public bool IsExpired => DateTimeOffset.UtcNow >= ExpiresAt;
        public bool IsRevoked => RevokedAt is not null;
        public bool IsActive => !IsExpired && !IsRevoked;

        private RefreshToken() { }

        private RefreshToken(Guid id, string token, string identityId, DateTimeOffset expiresAt)
        {
            Id = id;
            Token = token;
            IdentityId = identityId;
            CreatedAt = DateTimeOffset.UtcNow;
            ExpiresAt = expiresAt;
        }

        public static Result<RefreshToken> Create(string token, string userId, TimeSpan lifetime)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return Result.Failure<RefreshToken>(
                    DomainError.InvalidState(nameof(RefreshToken), "Token is required."));
            }

            if (string.IsNullOrWhiteSpace(userId))
            {
                return Result.Failure<RefreshToken>(
                    DomainError.InvalidState(nameof(RefreshToken), "identityId is required."));
            }

            if (lifetime <= TimeSpan.Zero)
            {
                return Result.Failure<RefreshToken>(
                    DomainError.InvalidState(nameof(RefreshToken), "Lifetime must be greater than zero."));
            }

            var expires = DateTimeOffset.UtcNow.Add(lifetime);

            return Result.Success(
                new RefreshToken(Guid.CreateVersion7(), token, userId, expires));
        }

        public Result Revoke()
        {
            if (IsExpired)
            {
                return Result.Failure(
                    DomainError.InvalidState(nameof(RefreshToken), "Token is expired and cannot be revoked."));
            }

            if (IsRevoked)
            {
                return Result.Failure(
                    DomainError.InvalidState(nameof(RefreshToken), "Token is already revoked."));
            }

            RevokedAt = DateTimeOffset.UtcNow;
            return Result.Success();
        }
    }
}