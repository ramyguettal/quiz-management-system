using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using quiz_management_system.Domain.UserSubmission.Answers;

namespace Expense_Tracker.Infrastructure.Data.Configurations;

public class OptionAnswerConfiguration : IEntityTypeConfiguration<OptionAnswer>
{
    public void Configure(EntityTypeBuilder<OptionAnswer> builder)
    {
        builder.ToTable("OptionAnswers");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.MultipleChoiceAnswerId)
            .IsRequired();

        builder.Property(x => x.SelectedOptionId)
            .IsRequired();

        builder.Property(x => x.IsCorrect)
            .IsRequired();

        builder.Property(x => x.SelectedAtUtc)
            .IsRequired();

        // Relationships
        builder.HasOne(x => x.MultipleChoiceAnswer)
            .WithMany(x => x.SelectedOptions)
            .HasForeignKey(x => x.MultipleChoiceAnswerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.SelectedOption)
            .WithMany()
            .HasForeignKey(x => x.SelectedOptionId)
            .OnDelete(DeleteBehavior.Restrict);

        // Index for querying
        builder.HasIndex(x => x.MultipleChoiceAnswerId);
    }
}