namespace quiz_management_system.Contracts.Requests;

public sealed record UpdatePasswordRequest(string CurrentPassword, string NewPassword);
