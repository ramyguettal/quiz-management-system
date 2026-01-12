namespace quiz_management_system.Domain.Common;

/// <summary>
/// Represents a logged activity in the system for admin audit trail.
/// </summary>
public sealed class RecentActivity : Entity
{
    /// <summary>
    /// Type of activity performed.
    /// </summary>
    public ActivityType ActivityType { get; private set; }

    /// <summary>
    /// Human-readable description of the activity.
    /// Example: "Admin Ahmed created a new student John Doe"
    /// </summary>
    public string Description { get; private set; } = string.Empty;

    /// <summary>
    /// ID of the user who performed the action.
    /// </summary>
    public Guid PerformedById { get; private set; }

    /// <summary>
    /// Cached name of the user who performed the action.
    /// </summary>
    public string PerformedByName { get; private set; } = string.Empty;

    /// <summary>
    /// Role of the user who performed the action (Admin, Instructor, etc.)
    /// </summary>
    public string PerformedByRole { get; private set; } = string.Empty;

    /// <summary>
    /// Optional ID of the entity that was affected by the action.
    /// </summary>
    public Guid? TargetEntityId { get; private set; }

    /// <summary>
    /// Optional type of the entity (Student, Quiz, Course, etc.)
    /// </summary>
    public string? TargetEntityType { get; private set; }

    /// <summary>
    /// Optional name of the entity that was affected.
    /// </summary>
    public string? TargetEntityName { get; private set; }

    /// <summary>
    /// UTC timestamp when the activity occurred.
    /// Uses Guid.CreateVersion7() for time-based ordering.
    /// </summary>
    public DateTimeOffset CreatedAtUtc { get; private set; }

    // Private constructor for EF Core
    private RecentActivity() : base() { }

    /// <summary>
    /// Creates a new RecentActivity instance.
    /// </summary>
    public static RecentActivity Create(
        ActivityType activityType,
        string description,
        Guid performedById,
        string performedByName,
        string performedByRole,
        Guid? targetEntityId = null,
        string? targetEntityType = null,
        string? targetEntityName = null)
    {
        return new RecentActivity
        {
            ActivityType = activityType,
            Description = description,
            PerformedById = performedById,
            PerformedByName = performedByName,
            PerformedByRole = performedByRole,
            TargetEntityId = targetEntityId,
            TargetEntityType = targetEntityType,
            TargetEntityName = targetEntityName,
            CreatedAtUtc = DateTimeOffset.UtcNow
        };
    }
}
