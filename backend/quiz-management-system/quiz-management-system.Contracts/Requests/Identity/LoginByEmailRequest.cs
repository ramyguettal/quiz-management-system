namespace quiz_management_system.Contracts.Requests.Identity;

public sealed record LoginRequest
{
    /// <summary>
    /// The email address of the user attempting to log in.
    /// </summary>
    public required string Email { get; init; }

    /// <summary>
    /// The user's password.
    /// </summary>
    public required string Password { get; init; }
}