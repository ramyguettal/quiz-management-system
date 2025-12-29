namespace quiz_management_system.Contracts.Requests.Identity;

public sealed record RefreshTokenRequest(
    string DeviceId);