using Dodo.Primitives;
using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;

public class Course : Entity
{
    public string Title { get; private set; } = string.Empty;
    public Guid AcademicYearId { get; private set; }
    public AcademicYear AcademicYear { get; private set; } = default!;
    private Course() { } // EF Core

    private Course(Guid id, string title, AcademicYear year) : base(id)
    {
        Title = title;
        AcademicYear = year;
        AcademicYearId = year.Id;
    }

    public static Result<Course> Create(Guid id, string title, AcademicYear year)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure<Course>(
                DomainError.InvalidState(nameof(Course), "Course title cannot be empty")
            );

        if (year is null)
            return Result.Failure<Course>(
                DomainError.InvalidState(nameof(Course), "AcademicYear is required")
            );

        return Result.Success(new Course(id, title, year));
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
