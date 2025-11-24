using Dodo.Primitives;
using quiz_management_system.Domain.AcademicYearFolder;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.Abstraction;

namespace quiz_management_system.Domain.Users.StudentsFolder;

public sealed class Student : DomainUser
{
    public Uuid AcademicYearId { get; private set; }
    public AcademicYear AcademicYear { get; private set; } = default!;

    private Student() : base() { } // EF Core

    public Student(Uuid id, string fullName, string email, AcademicYear academicYear)
        : base(id, fullName, email, Enums.Role.Student)
    {
        if (academicYear is null)
            throw new ArgumentNullException(nameof(academicYear));

        AcademicYear = academicYear;
        AcademicYearId = academicYear.Id;
    }

    public static Result<Student> Create(Uuid id, string fullName, string email, AcademicYear year)
    {
        if (year is null)
            return Result.Failure<Student>(
                DomainError.InvalidState(nameof(Student), "AcademicYear cannot be null")
            );

        if (string.IsNullOrWhiteSpace(fullName))
            return Result.Failure<Student>(
                DomainError.InvalidState(nameof(Student), "Full name cannot be empty")
            );

        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure<Student>(
                DomainError.InvalidState(nameof(Student), "Email cannot be empty")
            );
        if (id == Uuid.Empty)
            return Result.Failure<Student>(
                DomainError.InvalidState(nameof(Student), "Id cannot be empty")
            );

        return Result.Success(new Student(id, fullName, email, year));
    }

    public Result UpdateAcademicYear(AcademicYear academicYear)
    {
        if (academicYear is null)
        {
            return Result.Failure(
                DomainError.InvalidState(nameof(Student), "Academic year cannot be null.")
            );
        }

        AcademicYear = academicYear;
        AcademicYearId = academicYear.Id;

        return Result.Success();
    }
}
