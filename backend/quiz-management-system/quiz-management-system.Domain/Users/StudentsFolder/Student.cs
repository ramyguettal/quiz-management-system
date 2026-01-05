using quiz_management_system.Domain.AcademicYearFolder;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.Abstraction;
using quiz_management_system.Domain.Users.StudentsFolder.Enums;
using quiz_management_system.Domain.UserSubmission;
namespace quiz_management_system.Domain.Users.StudentsFolder;

public sealed class Student : DomainUser
{
    public Guid AcademicYearId { get; private set; }
    public AcademicYear AcademicYear { get; private set; } = default!;


    private readonly List<QuizSubmission> _submissions = new();
    public IReadOnlyCollection<QuizSubmission> Submissions => _submissions.AsReadOnly();
    private Student() : base() { } // EF Core

    private Student(Guid id, string fullName, string email, AcademicYear academicYear, UserStatus status, Role role)
        : base(id, fullName, email, role)
    {
        AcademicYear = academicYear;
        AcademicYearId = academicYear.Id;
    }


    public static Result<Student> Create(
        Guid id,
        string fullName,
        string email,

        AcademicYear year,
        UserStatus status = UserStatus.Active, bool fireEvent = true)
    {
        var validation = Validate(id, fullName, email, year);
        if (validation.IsFailure)
            return Result.Failure<Student>(validation.TryGetError());

        Student student = new Student(id, fullName, email, year, status, Role.Student);
        if (fireEvent)
            student.FireUserCreatedEvent(id, email, fullName, nameof(Student));
        return Result.Success(student);
    }

    public static Result<Student> Create(
        string fullName,
        string email,

        AcademicYear year,
        UserStatus status = UserStatus.Active,
        bool fireEvent = true)
    {
        Guid newId = Guid.CreateVersion7();

        var validation = Validate(newId, fullName, email, year);
        if (validation.IsFailure)
            return Result.Failure<Student>(validation.TryGetError());

        Student student = new Student(newId, fullName, email, year, status, Role.Student);


        if (fireEvent)
            student.FireUserCreatedEvent(newId, email, fullName, nameof(Student));
        return Result.Success(student);
    }


    private static Result Validate(
        Guid id,
        string fullName,
        string email,

        AcademicYear year)
    {
        if (id == Guid.Empty)
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

}
