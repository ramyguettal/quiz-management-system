using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using quiz_management_system.Domain.UserSubmission;

namespace Expense_Tracker.Infrastructure.Data.Configurations;

public sealed class QuizSubmissionConfiguration : IEntityTypeConfiguration<QuizSubmission>
{
    public void Configure(EntityTypeBuilder<QuizSubmission> builder)
    {
        builder.ToTable("QuizSubmissions");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(s => s.QuizId)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(s => s.StudentId)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(s => s.StartedAtUtc)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.Property(s => s.SubmittedAtUtc)
            .HasColumnType("timestamp with time zone")
            .IsRequired(false);

        builder.Property(s => s.GradedAtUtc)
            .HasColumnType("timestamp with time zone")
            .IsRequired(false);

        builder.Property(s => s.Status)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        // Scoring properties with precision
        builder.Property(s => s.RawScore)
            .HasColumnType("decimal(10,2)")
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(s => s.MaxScore)
            .HasColumnType("decimal(10,2)")
            .IsRequired();

        builder.Property(s => s.ScaledScore)
            .HasColumnType("decimal(5,2)")
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(s => s.Percentage)
            .HasColumnType("decimal(5,2)")
            .IsRequired()
            .HasDefaultValue(0);

        // Audit fields
        builder.Property(s => s.CreatedAtUtc)
            .IsRequired()
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("NOW()");

        builder.Property(s => s.CreatedBy)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(s => s.LastModifiedUtc)
            .IsRequired()
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("NOW()");

        builder.Property(s => s.LastModifiedBy)
            .HasColumnType("uuid")
            .IsRequired();

        // ============================================================
        // Relationships
        // ============================================================

        builder.HasOne(s => s.Quiz)
            .WithMany(q => q.Submissions)
            .HasForeignKey(s => s.QuizId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(q => q.Student)
               .WithMany(s => s.Submissions)
               .HasForeignKey(q => q.StudentId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(s => s.Answers)
            .WithOne(a => a.Submission)
            .HasForeignKey(a => a.SubmissionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(s => s.Answers)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        // ============================================================
        // Indexes
        // ============================================================

        // Find submissions by student
        builder.HasIndex(s => s.StudentId)
            .HasDatabaseName("IX_QuizSubmissions_StudentId");

        // Find submissions by quiz
        builder.HasIndex(s => s.QuizId)
            .HasDatabaseName("IX_QuizSubmissions_QuizId");

        // Find submissions by status
        builder.HasIndex(s => s.Status)
            .HasDatabaseName("IX_QuizSubmissions_Status");

        // Composite: Student's submissions for a quiz
        builder.HasIndex(s => new { s.StudentId, s.QuizId })
            .HasDatabaseName("IX_QuizSubmissions_StudentId_QuizId");

        // Composite: Quiz submissions by status
        builder.HasIndex(s => new { s.QuizId, s.Status, s.SubmittedAtUtc })
            .HasDatabaseName("IX_QuizSubmissions_QuizId_Status_SubmittedAt");

        // Unique constraint: One submission per student per quiz
        builder.HasIndex(s => new { s.StudentId, s.QuizId })
            .IsUnique()
            .HasDatabaseName("UX_QuizSubmissions_StudentId_QuizId");
    }
}
