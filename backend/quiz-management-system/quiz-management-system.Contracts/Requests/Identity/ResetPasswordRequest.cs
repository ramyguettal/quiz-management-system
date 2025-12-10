namespace quiz_management_system.Contracts.Requests.Identity;

public sealed record ResetPasswordRequest
{
    public required Guid UserId { get; init; }
    public required string Code { get; init; }
    public required string NewPassword { get; init; }
}