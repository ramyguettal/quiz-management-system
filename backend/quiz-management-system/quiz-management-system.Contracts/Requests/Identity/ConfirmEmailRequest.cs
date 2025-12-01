namespace quiz_management_system.Contracts.Requests.Identity;

public sealed record ConfirmEmailRequest(string IdentityId, string Code);
