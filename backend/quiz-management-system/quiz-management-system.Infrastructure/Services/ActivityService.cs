using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common;

namespace quiz_management_system.Infrastructure.Services;

/// <summary>
/// Service for logging recent activities to the database.
/// Automatically fetches performer name from the database for efficiency.
/// </summary>
public sealed class ActivityService(IAppDbContext db) : IActivityService, IScopedService
{
    public async Task LogActivityAsync(
        ActivityType type,
        Guid performedById,
        string performedByRole,
        string description,
        Guid? targetEntityId = null,
        string? targetEntityType = null,
        string? targetEntityName = null,
        CancellationToken ct = default)
    {
        // Fetch performer name directly from database with projection for efficiency
        string performerName = await db.Users
            .Where(u => u.Id == performedById)
            .Select(u => u.FullName)
            .FirstOrDefaultAsync(ct) ?? "System";

        var activity = RecentActivity.Create(
            type,
            description,
            performedById,
            performerName,
            performedByRole,
            targetEntityId,
            targetEntityType,
            targetEntityName);

        db.RecentActivities.Add(activity);
        await db.SaveChangesAsync(ct);
    }
}
