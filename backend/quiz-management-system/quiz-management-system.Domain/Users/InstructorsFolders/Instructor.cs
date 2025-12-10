using quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.GroupFolder;
using quiz_management_system.Domain.Users.Abstraction;

namespace quiz_management_system.Domain.Users.InstructorsFolders;

public sealed class Instructor : DomainUser
{
    public string Title { get; private set; } = default!;
    public string PhoneNumber { get; private set; } = default!;
    public string Department { get; private set; } = default!;
    public string OfficeLocation { get; private set; } = default!;
    public string Bio { get; private set; } = string.Empty;

    private readonly List<InstructorCourse> _courses = new();
    public IReadOnlyList<InstructorCourse> Courses => _courses.AsReadOnly();

    private readonly List<GroupInstructor> _groups = new();
    public IReadOnlyList<GroupInstructor> Groups => _groups.AsReadOnly();

    private Instructor() : base() { } // EF Core

    private Instructor(
        Guid id,
        string fullName,
        string email,
        string title,
        string phoneNumber,
        string department,
        string officeLocation,
        string bio,
        Role role
    )
        : base(id, fullName, email, role)
    {
        Title = title;
        PhoneNumber = phoneNumber;
        Department = department;
        OfficeLocation = officeLocation;
        Bio = bio;
    }


    public static Result<Instructor> Create(
        Guid id,
        string fullName,
        string email,
        string title,
        string phoneNumber,
        string department,
        string officeLocation,
        string bio,
        bool fireEvent = true)
    {
        if (id == Guid.Empty)
            return Result.Failure<Instructor>(
                DomainError.InvalidState(nameof(Instructor), "Id cannot be empty")
            );

        if (string.IsNullOrWhiteSpace(fullName))
            return Result.Failure<Instructor>(
                DomainError.InvalidState(nameof(Instructor), "Full name is required")
            );

        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure<Instructor>(
                DomainError.InvalidState(nameof(Instructor), "Email is required")
            );

        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure<Instructor>(
                DomainError.InvalidState(nameof(Instructor), "Title is required")
            );

        if (string.IsNullOrWhiteSpace(department))
            return Result.Failure<Instructor>(
                DomainError.InvalidState(nameof(Instructor), "Department is required")
            );

        var instructor = new Instructor(
            id,
            fullName,
            email,
            title,
            phoneNumber,
            department,
            officeLocation,
            bio,
            Role.Instructor
        );

        if (fireEvent)
            instructor.FireUserCreatedEvent(id, email, fullName, nameof(Instructor));

        return Result.Success(instructor);
    }

    public Result ChangeFullName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            return Result.Failure(DomainError.InvalidState(nameof(Instructor), "Full name is required."));
        FullName = fullName;
        return Result.Success();
    }

    public Result ChangeTitle(string title)
    {
        Title = title;
        return Result.Success();
    }

    public Result ChangePhoneNumber(string phoneNumber)
    {
        PhoneNumber = phoneNumber;
        return Result.Success();
    }

    public Result ChangeDepartment(string department)
    {
        if (string.IsNullOrWhiteSpace(department))
            return Result.Failure(DomainError.InvalidState(nameof(Department), "Department is required."));
        Department = department;
        return Result.Success();
    }

    public Result ChangeOfficeLocation(string officeLocation)
    {
        OfficeLocation = officeLocation;
        return Result.Success();
    }

    public Result ChangeBio(string bio)
    {
        Bio = bio ?? string.Empty;
        return Result.Success();
    }

    public Result UpdateProfile(
        string fullName,
        string title,
        string phoneNumber,
        string department,
        string officeLocation,
        string bio)
    {
        var nameResult = ChangeFullName(fullName);
        if (nameResult.IsFailure) return nameResult;

        ChangeTitle(title);
        ChangePhoneNumber(phoneNumber);
        ChangeDepartment(department);
        ChangeOfficeLocation(officeLocation);
        ChangeBio(bio);

        return Result.Success();
    }

    public Result AssignCourse(Course course)
    {
        if (course is null)
            return Result.Failure(DomainError.InvalidState(nameof(Course), "Course cannot be null."));

        if (_courses.Any(x => x.CourseId == course.Id))
            return Result.Success();

        _courses.Add(InstructorCourse.Create(this, course));
        return Result.Success();
    }

    public Result RemoveCourse(Course course)
    {
        var link = _courses.FirstOrDefault(x => x.CourseId == course.Id);
        if (link is null)
            return Result.Success();

        _courses.Remove(link);
        return Result.Success();
    }
}