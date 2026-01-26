using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using quiz_management_system.Domain.QuizesFolder.QuizGroupFolder;

namespace quiz_management_system.Infrastructure.Data.Configurations;

public sealed class QuizGroupConfiguration : IEntityTypeConfiguration<QuizGroup>
{
    public void Configure(EntityTypeBuilder<QuizGroup> builder)
    {
        builder.ToTable("QuizGroups");

        builder.HasKey(x => new { x.QuizId, x.GroupId });

        builder.HasOne(x => x.Quiz)
            .WithMany(q => q.Groups)
            .HasForeignKey(x => x.QuizId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Group)
            .WithMany(g => g.Groups)
            .HasForeignKey(x => x.GroupId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}