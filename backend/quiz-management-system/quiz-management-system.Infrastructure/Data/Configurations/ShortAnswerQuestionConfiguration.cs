using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;

namespace quiz_management_system.Infrastructure.Data.Configurations;

public sealed class ShortAnswerQuestionConfiguration : IEntityTypeConfiguration<ShortAnswerQuestion>
{
    public void Configure(EntityTypeBuilder<ShortAnswerQuestion> builder)
    {


        builder.Property(q => q.ExpectedAnswer)
            .HasMaxLength(2000);
    }
}