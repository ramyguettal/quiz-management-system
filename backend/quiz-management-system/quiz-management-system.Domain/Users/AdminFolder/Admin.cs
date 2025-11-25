using Dodo.Primitives;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.Abstraction;

namespace quiz_management_system.Domain.Users.AdminFolder;


public sealed class Admin : DomainUser
{
    public string? Department { get; private set; }

    private Admin() : base() { } // EF Core

    public Admin(Uuid id, string fullName, string email, string? department)
        : base(id, fullName, email)
    {
        Department = department;
    }

    public static Result<Admin> Create(Uuid id, string fullName, string email, string? department, bool fireEvent)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            return Result.Failure<Admin>(
                DomainError.InvalidState(nameof(Admin), "Full name cannot be empty")
            );

        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure<Admin>(
                DomainError.InvalidState(nameof(Admin), "Email cannot be empty")
            );

        if (id == Uuid.Empty)
            return Result.Failure<Admin>(
                DomainError.InvalidState(nameof(Admin), "Id cannot be empty")
            );
        var admin = new Admin(id, fullName, email, department);
        if (fireEvent)
            admin.FireUserCreatedEvent(id.ToString(), fullName, email, nameof(Admin));

        return Result.Success(admin);
    }
    public Result UpdateDepartment(string? department)
    {
        if (string.IsNullOrWhiteSpace(department))
        {
            return Result.Failure(
                DomainError.InvalidState(nameof(Admin), "Department cannot be empty")
            );
        }

        Department = department;
        return Result.Success();
    }
}