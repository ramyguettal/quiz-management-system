using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using quiz_management_system.Domain.Users.InstructorsFolders;

namespace quiz_management_system.Infrastructure.Data.Configurations;

public sealed class InstructorConfiguration : IEntityTypeConfiguration<Instructor>
{
    public void Configure(EntityTypeBuilder<Instructor> builder)
    {


        builder.Property(i => i.Title)
               .HasMaxLength(150);

        builder.Property(i => i.Department)
               .HasMaxLength(150);

        builder.Property(i => i.PhoneNumber)
               .HasMaxLength(20);

        builder.Property(i => i.OfficeLocation)
               .HasMaxLength(200);

        builder.Navigation(i => i.Courses)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.Navigation(i => i.Groups)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}