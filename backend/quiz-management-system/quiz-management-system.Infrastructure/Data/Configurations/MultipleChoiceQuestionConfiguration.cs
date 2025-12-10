using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;

namespace quiz_management_system.Infrastructure.Data.Configurations;

public sealed class MultipleChoiceQuestionConfiguration : IEntityTypeConfiguration<MultipleChoiceQuestion>
{
    public void Configure(EntityTypeBuilder<MultipleChoiceQuestion> builder)
    {
        builder.ToTable("MultipleChoiceQuestions");

        builder.Property(q => q.ShuffleOptions)
            .IsRequired();

        builder.Navigation(q => q.Options)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}