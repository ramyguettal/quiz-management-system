using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using quiz_management_system.Domain.Users.Abstraction;
using quiz_management_system.Domain.Users.StudentsFolder;
using quiz_management_system.Domain.UserSubmission;

namespace quiz_management_system.Infrastructure.Data.Configurations;

public sealed class StudentConfiguration : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> builder)
    {


        builder.HasBaseType<DomainUser>();

        builder.Property(x => x.AcademicYearId)
               .HasColumnType("uuid")
               .IsRequired();

        builder.HasOne(x => x.AcademicYear)
               .WithMany()
               .HasForeignKey(x => x.AcademicYearId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.Navigation(x => x.AcademicYear)
               .UsePropertyAccessMode(PropertyAccessMode.Property);
        builder
         .HasMany<QuizSubmission>()
         .WithOne(s => s.Student)
         .HasForeignKey(s => s.StudentId)
         .OnDelete(DeleteBehavior.Restrict);

        builder
            .Navigation(s => s.Submissions)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

    }
}