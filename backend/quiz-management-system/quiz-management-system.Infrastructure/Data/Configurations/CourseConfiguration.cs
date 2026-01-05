using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;

namespace quiz_management_system.Infrastructure.Data.Configurations;

public sealed class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.ToTable("Courses");
        builder.Property(x => x.Code)
       .IsRequired()

       .HasMaxLength(50); // adjust length as needed

        builder.Property(x => x.Description)
               .HasMaxLength(1000); // optional, adjust length as ne

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
               .HasColumnType("uuid")
               .IsRequired();

        builder.Property(x => x.Title)
               .IsRequired()
               .HasMaxLength(300);

        builder.Property(x => x.AcademicYearId)
               .HasColumnType("uuid")
               .IsRequired();

        builder.HasOne(x => x.AcademicYear)
               .WithMany(y => y.Courses)
               .HasForeignKey(x => x.AcademicYearId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(t => t.Code)
            .IsUnique(true);
    }
}
