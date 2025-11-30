using quiz_management_system.Domain.Common;

namespace quiz_management_system.Domain.Events;

public record ResetPasswordEvent(string userId, string Email, string FullName, string Role) : DomainEvent;
