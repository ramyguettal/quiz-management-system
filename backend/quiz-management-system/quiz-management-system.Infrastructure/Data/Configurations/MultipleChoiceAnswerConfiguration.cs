using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using quiz_management_system.Domain.UserSubmission.Answers;
using quiz_management_system.Domain.UserSubmission.Answers.Abstraction;

namespace Expense_Tracker.Infrastructure.Data.Configurations;



public class MultipleChoiceAnswerConfiguration : IEntityTypeConfiguration<MultipleChoiceAnswer>
{
    public void Configure(EntityTypeBuilder<MultipleChoiceAnswer> builder)
    {
        builder.HasBaseType<QuestionAnswer>();


    }
}