using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using quiz_management_system.Domain.UserSubmission.Answers;
using quiz_management_system.Domain.UserSubmission.Answers.Abstraction;

namespace Expense_Tracker.Infrastructure.Data.Configurations;

// ============================================================
// 4. SHORT ANSWER CONFIGURATION
// ============================================================

public sealed class ShortAnswerConfiguration : IEntityTypeConfiguration<ShortAnswer>
{
    public void Configure(EntityTypeBuilder<ShortAnswer> builder)
    {
        builder.HasBaseType<QuestionAnswer>();

        builder.Property(a => a.AnswerText)
            .HasColumnType("text")
            .IsRequired();

        builder.Property(a => a.SimilarityScore)
            .HasColumnType("decimal(5,4)")
            .IsRequired()
            .HasDefaultValue(0);

        builder.HasIndex(a => a.AnswerText);


    }
}