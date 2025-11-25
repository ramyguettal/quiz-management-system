using Dodo.Primitives;
using quiz_management_system.Domain.AcademicYearFolder;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.Abstraction;
using quiz_management_system.Domain.Users.StudentsFolder.Enums;
namespace quiz_management_system.Domain.Users.StudentsFolder;

public sealed class Student : DomainUser
{
    public Uuid AcademicYearId { get; private set; }
    public float AverageGrade { get; private set; }
    public AcademicYear AcademicYear { get; private set; } = default!;
    public StudentStatus Status { get; private set; } = StudentStatus.Active;
    private Student() : base() { } // EF Core

    private Student(Uuid id, string fullName, string email, float averageGrade, AcademicYear academicYear, StudentStatus status)
        : base(id, fullName, email)
    {
        AcademicYear = academicYear;
        AcademicYearId = academicYear.Id;
        AverageGrade = averageGrade;
        Status = status;
    }


    public static Result<Student> Create(
        Uuid id,
        string fullName,
        string email,
        float averageGrade,
        AcademicYear year,
        StudentStatus status = StudentStatus.Active, bool fireEvent = true)
    {
        var validation = Validate(id, fullName, email, averageGrade, year);
        if (validation.IsFailure)
            return Result.Failure<Student>(validation.TryGetError());

        Student student = new Student(id, fullName, email, averageGrade, year, status);
        if (fireEvent)
            student.FireUserCreatedEvent(id.ToString(), fullName, email, nameof(Student));
        return Result.Success(student);
    }

    public static Result<Student> Create(
        string fullName,
        string email,
        float averageGrade,
        AcademicYear year,
        StudentStatus status = StudentStatus.Active,
        bool fireEvent = true)
    {
        Uuid newId = Uuid.CreateVersion7();

        var validation = Validate(newId, fullName, email, averageGrade, year);
        if (validation.IsFailure)
            return Result.Failure<Student>(validation.TryGetError());

        Student student = new Student(newId, fullName, email, averageGrade, year, status);

        if (fireEvent)
            student.FireUserCreatedEvent(newId.ToString(), fullName, email, nameof(Student));
        return Result.Success(student);
    }


    private static Result Validate(
        Uuid id,
        string fullName,
        string email,
        float averageGrade,
        AcademicYear year)
    {
        if (id == Uuid.Empty)
            return Result.Failure(
                DomainError.InvalidState(nameof(Student), "Id cannot be empty"));

        if (year is null)
            return Result.Failure(
                DomainError.InvalidState(nameof(Student), "AcademicYear cannot be null"));

        if (string.IsNullOrWhiteSpace(fullName))
            return Result.Failure(
                DomainError.InvalidState(nameof(Student), "Full name cannot be empty"));

        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure(
                DomainError.InvalidState(nameof(Student), "Email cannot be empty"));

        if (averageGrade < 0 || averageGrade > 20)
            return Result.Failure(
                DomainError.InvalidState(nameof(Student),
                "Average Grade must be between 0 and 20"));

        return Result.Success();
    }

    public Result UpdateAcademicYear(AcademicYear academicYear)
    {
        if (academicYear is null)
        {
            return Result.Failure(
                DomainError.InvalidState(nameof(Student), "Academic year cannot be null."));
        }

        AcademicYear = academicYear;
        AcademicYearId = academicYear.Id;

        return Result.Success();
    }
    public Result ActivateStudent()
    {
        Status = StudentStatus.Active;
        return Result.Success();
    }

    public Result DisActivateStudent()
    {
        Status = StudentStatus.InActive;
        return Result.Success();
    }
}
