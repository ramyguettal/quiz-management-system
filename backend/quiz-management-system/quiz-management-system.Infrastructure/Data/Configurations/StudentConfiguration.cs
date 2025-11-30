using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using quiz_management_system.Domain.Users.StudentsFolder;

namespace quiz_management_system.Infrastructure.Data.Configurations;

public sealed class StudentConfiguration : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> builder)
    {
        builder.ToTable("Students");

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

        builder.Property(x => x.AcademicYearId)
               .HasColumnType("uuid")
               .IsRequired();
    }
}