using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using quiz_management_system.Domain.Common;

namespace quiz_management_system.Infrastructure.Data.Configurations;

/// <summary>
/// EF Core configuration for RecentActivity entity.
/// Optimized for PostgreSQL with efficient cursor-based pagination.
/// </summary>
public class RecentActivityConfiguration : IEntityTypeConfiguration<RecentActivity>
{
    public void Configure(EntityTypeBuilder<RecentActivity> builder)
    {
        builder.ToTable("recent_activities");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(x => x.ActivityType)
            .HasColumnName("activity_type")
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.Description)
            .HasColumnName("description")
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.PerformedById)
            .HasColumnName("performed_by_id")
            .IsRequired();

        builder.Property(x => x.PerformedByName)
            .HasColumnName("performed_by_name")
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.PerformedByRole)
            .HasColumnName("performed_by_role")
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.TargetEntityId)
            .HasColumnName("target_entity_id");

        builder.Property(x => x.TargetEntityType)
            .HasColumnName("target_entity_type")
            .HasMaxLength(100);

        builder.Property(x => x.TargetEntityName)
            .HasColumnName("target_entity_name")
            .HasMaxLength(200);

        builder.Property(x => x.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        // Primary index for cursor-based pagination (CreatedAtUtc DESC, Id DESC)
        builder.HasIndex(x => new { x.CreatedAtUtc, x.Id })
            .IsDescending(true, true)
            .HasDatabaseName("ix_recent_activities_cursor");

        // Index for filtering by activity type
        builder.HasIndex(x => x.ActivityType)
            .HasDatabaseName("ix_recent_activities_activity_type");

        // Index for filtering by performer
        builder.HasIndex(x => x.PerformedById)
            .HasDatabaseName("ix_recent_activities_performed_by_id");
    }
}
