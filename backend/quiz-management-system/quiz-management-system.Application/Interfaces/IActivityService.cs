using quiz_management_system.Domain.Common;

namespace quiz_management_system.Application.Interfaces;

/// <summary>
/// Service for logging recent activities in the system.
/// </summary>
public interface IActivityService
{
    /// <summary>
    /// Logs an activity to the system.
    /// Automatically fetches performer name from the database.
    /// </summary>
    Task LogActivityAsync(
        ActivityType type,
        Guid performedById,
        string performedByRole,
        string description,
        Guid? targetEntityId = null,
        string? targetEntityType = null,
        string? targetEntityName = null,
        CancellationToken ct = default);
}
