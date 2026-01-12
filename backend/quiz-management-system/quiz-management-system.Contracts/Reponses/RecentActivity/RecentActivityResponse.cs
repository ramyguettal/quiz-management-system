using quiz_management_system.Domain.Common;

namespace quiz_management_system.Contracts.Reponses.RecentActivity;

/// <summary>
/// Response DTO for a recent activity.
/// </summary>
public sealed record RecentActivityResponse(
    Guid Id,
    ActivityType ActivityType,
    string ActivityTypeName,
    string Description,
    Guid PerformedById,
    string PerformedByName,
    string PerformedByRole,
    Guid? TargetEntityId,
    string? TargetEntityType,
    string? TargetEntityName,
    DateTimeOffset CreatedAtUtc,
    string TimeAgo
);
