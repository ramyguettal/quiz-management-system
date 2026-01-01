using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using quiz_management_system.Domain.UserSubmission.Answers;
using quiz_management_system.Domain.UserSubmission.Answers.Abstraction;

namespace Expense_Tracker.Infrastructure.Data.Configurations;

// ============================================================
// 2. QUESTION ANSWER CONFIGURATION (BASE)
// ============================================================

public sealed class QuestionAnswerConfiguration : IEntityTypeConfiguration<QuestionAnswer>
{
    public void Configure(EntityTypeBuilder<QuestionAnswer> builder)
    {
        builder.ToTable("QuestionAnswers");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(a => a.SubmissionId)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(a => a.QuestionId)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(a => a.QuestionPoints)
            .IsRequired();

        builder.Property(a => a.PointsEarned)
            .HasColumnType("decimal(10,2)")
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(a => a.IsCorrect)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(a => a.AnsweredAtUtc)
            .IsRequired()
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("NOW()");

        // ============================================================
        // TPH Discriminator
        // ============================================================

        builder.HasDiscriminator<string>("AnswerType")
            .HasValue<MultipleChoiceAnswer>("MultipleChoice")
            .HasValue<ShortAnswer>("ShortAnswer");

        builder.Property("AnswerType")
            .HasMaxLength(50)
            .IsRequired();

        // ============================================================
        // Relationships
        // ============================================================

        builder.HasOne(a => a.Question)
            .WithMany()
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        // ============================================================
        // Indexes
        // ============================================================

        builder.HasIndex(a => a.SubmissionId)
            .HasDatabaseName("IX_QuestionAnswers_SubmissionId");

        builder.HasIndex(a => a.QuestionId)
            .HasDatabaseName("IX_QuestionAnswers_QuestionId");

        // Ensure one answer per question per submission
        builder.HasIndex(a => new { a.SubmissionId, a.QuestionId })
            .IsUnique()
            .HasDatabaseName("UX_QuestionAnswers_SubmissionId_QuestionId");
    }
}
