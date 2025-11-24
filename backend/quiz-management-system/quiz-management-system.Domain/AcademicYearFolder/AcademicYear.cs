using Dodo.Primitives;
using quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;
using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Domain.AcademicYearFolder;

public class AcademicYear : AggregateRoot
{
    public string Name { get; private set; } = string.Empty;

    private readonly List<Course> _courses = new();
    public IReadOnlyList<Course> Courses => _courses.AsReadOnly();

    private AcademicYear() { } // EF Core

    public AcademicYear(Uuid id, string name) : base(id)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Academic year name cannot be empty.");

        Name = name;
    }
    public static Result<AcademicYear> Create(Uuid id, string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<AcademicYear>(
                DomainError.InvalidState(nameof(AcademicYear), "Name cannot be empty")
            );

        if (id == Uuid.Empty)
            return Result.Failure<AcademicYear>(
                DomainError.InvalidState(nameof(AcademicYear), "Id cannot be empty")
            );

        return Result.Success(new AcademicYear(id, name));
    }

    public Result AddCourse(Uuid id, string title)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            return Result.Failure(
                DomainError.InvalidState(nameof(Course), "Course title cannot be empty.")
            );
        }

        var result = Course.Create(id, title, this);

        if (result.IsFailure)
            return result;

        _courses.Add(result.TryGetValue());
        return Result.Success();
    }
}