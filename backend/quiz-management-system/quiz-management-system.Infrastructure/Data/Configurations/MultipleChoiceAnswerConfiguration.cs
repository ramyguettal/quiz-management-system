using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using quiz_management_system.Domain.UserSubmission.Answers;
using quiz_management_system.Domain.UserSubmission.Answers.Abstraction;

namespace Expense_Tracker.Infrastructure.Data.Configurations;

// ============================================================
// 3. MULTIPLE CHOICE ANSWER CONFIGURATION
// ============================================================

public sealed class MultipleChoiceAnswerConfiguration : IEntityTypeConfiguration<MultipleChoiceAnswer>
{
    public void Configure(EntityTypeBuilder<MultipleChoiceAnswer> builder)
    {
        builder.HasBaseType<QuestionAnswer>();

        builder.Property(a => a.SelectedOptionId)
            .HasColumnType("uuid")
            .IsRequired();

        // Relationship to selected option
        builder.HasOne(a => a.SelectedOption)
            .WithMany()
            .HasForeignKey(a => a.SelectedOptionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Navigation(a => a.SelectedOption)
            .UsePropertyAccessMode(PropertyAccessMode.Property);

        // Index for finding answers by option
        builder.HasIndex(a => a.SelectedOptionId)
            .HasDatabaseName("IX_QuestionAnswers_SelectedOptionId");
    }
}
