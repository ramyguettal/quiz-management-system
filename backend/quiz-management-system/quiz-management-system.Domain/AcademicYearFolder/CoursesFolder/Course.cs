using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;

public class Course : Entity
{
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string Code { get; private set; } = string.Empty;

    public Guid AcademicYearId { get; private set; }
    public AcademicYear AcademicYear { get; private set; } = default!;

    private Course() { } // EF Core

    private Course(
        Guid id,
        string title,
        string description,
        string code,
        AcademicYear year) : base(id)
    {
        Title = title;
        Description = description;
        Code = code;
        AcademicYear = year;
        AcademicYearId = year.Id;
    }

    public static Result<Course> Create(
        Guid id,
        string title,
        string description,
        string code,
        AcademicYear year)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure<Course>(
                DomainError.InvalidState(nameof(Course), "Course title cannot be empty")
            );

        if (string.IsNullOrWhiteSpace(code))
            return Result.Failure<Course>(
                DomainError.InvalidState(nameof(Course), "Course code cannot be empty")
            );

        if (year is null)
            return Result.Failure<Course>(
                DomainError.InvalidState(nameof(Course), "AcademicYear is required")
            );

        return Result.Success(new Course(id, title, description ?? string.Empty, code, year));
    }

    public Result UpdateTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure(
                DomainError.InvalidState(nameof(Course), "Course title cannot be empty")
            );

        Title = title;
        return Result.Success();
    }

    public Result UpdateDescription(string description)
    {
        Description = description ?? string.Empty;
        return Result.Success();
    }

    public Result UpdateCode(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
            return Result.Failure(
                DomainError.InvalidState(nameof(Course), "Course code cannot be empty")
            );

        Code = code;
        return Result.Success();
    }

    public Result UpdateAcademicYear(AcademicYear year)
    {
        if (year is null)
            return Result.Failure(
                DomainError.InvalidState(nameof(Course), "AcademicYear is required"));

        AcademicYear = year;
        AcademicYearId = year.Id;
        return Result.Success();
    }
}