using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using quiz_management_system.Domain.Users.InstructorsFolders;

namespace quiz_management_system.Infrastructure.Data.Configurations;

public sealed class InstructorConfiguration : IEntityTypeConfiguration<Instructor>
{
    public void Configure(EntityTypeBuilder<Instructor> builder)
    {
        builder.ToTable("Instructors");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
               .HasColumnType("uuid")
               .IsRequired();

        builder.Property(x => x.FullName)
               .IsRequired()
               .HasMaxLength(200);

        builder.Property(x => x.Email)
               .IsRequired()
               .HasMaxLength(256);
    }
}