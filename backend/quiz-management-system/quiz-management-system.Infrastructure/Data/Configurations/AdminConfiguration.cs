using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using quiz_management_system.Domain.Users.Abstraction;
using quiz_management_system.Domain.Users.AdminFolder;

namespace quiz_management_system.Infrastructure.Data.Configurations;

public sealed class AdminConfiguration : IEntityTypeConfiguration<Admin>
{
    public void Configure(EntityTypeBuilder<Admin> builder)
    {

        // REQUIRED for TPC
        builder.HasBaseType<DomainUser>();

        builder.Property(x => x.FullName)
               .HasMaxLength(200)
               .IsRequired();

        builder.Property(x => x.Email)
               .HasMaxLength(256)
               .IsRequired();
    }
}