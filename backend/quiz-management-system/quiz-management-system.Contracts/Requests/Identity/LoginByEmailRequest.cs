namespace quiz_management_system.Contracts.Requests.Identity;

public sealed record LoginRequest(
    string Email,
    string Password,
    string DeviceId);
