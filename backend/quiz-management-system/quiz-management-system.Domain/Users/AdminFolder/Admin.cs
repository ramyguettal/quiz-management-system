using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.Abstraction;

namespace quiz_management_system.Domain.Users.AdminFolder;


public sealed class Admin : DomainUser
{

    private Admin() : base() { } // EF Core

    public Admin(Guid id, string fullName, string email, Role role)
        : base(id, fullName, email, role)
    {
    }

    public static Result<Admin> Create(Guid id, string fullName, string email, bool fireEvent)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            return Result.Failure<Admin>(
                DomainError.InvalidState(nameof(Admin), "Full name cannot be empty")
            );

        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure<Admin>(
                DomainError.InvalidState(nameof(Admin), "Email cannot be empty")
            );

        if (id == Guid.Empty)
            return Result.Failure<Admin>(
                DomainError.InvalidState(nameof(Admin), "Id cannot be empty")
            );
        var admin = new Admin(id, fullName, email, Role.Admin);
        if (fireEvent)
            admin.FireUserCreatedEvent(id, email, fullName, nameof(Admin));

        return Result.Success(admin);

    }
}