using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using quiz_management_system.Domain.Users.Abstraction;
using quiz_management_system.Domain.Users.AdminFolder;
using quiz_management_system.Domain.Users.InstructorsFolders;
using quiz_management_system.Domain.Users.StudentsFolder;

public sealed class DomainUserConfiguration : IEntityTypeConfiguration<DomainUser>
{
    public void Configure(EntityTypeBuilder<DomainUser> builder)
    {

        builder.UseTphMappingStrategy();
        builder.ToTable("Users");


        builder.HasKey(u => u.Id);

        builder.Property(u => u.Id)
            .HasColumnType("uuid")
            .IsRequired();


        builder.HasDiscriminator<string>("UserType")
            .HasValue<Admin>("Admin")
            .HasValue<Instructor>("Instructor")
            .HasValue<Student>("Student");

        builder.Property("UserType")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(u => u.FullName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(u => u.Role)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(u => u.Status)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(u => u.EmailNotifications)
            .IsRequired()
            .HasDefaultValue(false);

        // ============================================================
        // Audit Properties
        // ============================================================
        builder.Property(u => u.CreatedAtUtc)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.Property(u => u.CreatedBy)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(u => u.LastModifiedUtc)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.Property(u => u.LastModifiedBy)
            .HasColumnType("uuid")
            .IsRequired();

        // ============================================================
        // Soft Delete Configuration
        // ============================================================
        builder.Property(u => u.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(u => u.DeletedById)
            .HasColumnType("uuid")
            .IsRequired(false);

        builder.Property(u => u.DeletedOn)
            .HasColumnType("timestamp with time zone")
            .IsRequired(false);

        // Global query filter for soft delete
        builder.HasQueryFilter(u => !u.IsDeleted);



        // Profile Image (optional, nullable FK)
        builder.Property(u => u.ProfileImageFileId)
            .HasColumnType("uuid")
            .IsRequired(false);

        builder.HasOne(u => u.ProfileImage)
            .WithMany()
            .HasForeignKey(u => u.ProfileImageFileId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Navigation(u => u.ProfileImage)
            .UsePropertyAccessMode(PropertyAccessMode.Property);

        // Notifications (one-to-many)
        builder.HasMany(u => u.Notifications)
            .WithOne()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(u => u.Notifications)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        // ============================================================
        // Indexes for Performance
        // ============================================================

        // Most common queries
        builder.HasIndex(u => u.Email)
            .IsUnique()
            .HasDatabaseName("IX_Users_Email");

        builder.HasIndex(u => u.IsDeleted)
            .HasDatabaseName("IX_Users_IsDeleted");

        builder.HasIndex(u => u.Status)
            .HasDatabaseName("IX_Users_Status");

        // Composite index for filtering active users by role
        builder.HasIndex(u => new { u.IsDeleted, u.Role, u.Status })
            .HasDatabaseName("IX_Users_IsDeleted_Role_Status");

        // Index for audit queries
        builder.HasIndex(u => u.CreatedAtUtc)
            .HasDatabaseName("IX_Users_CreatedAtUtc");
    }
}