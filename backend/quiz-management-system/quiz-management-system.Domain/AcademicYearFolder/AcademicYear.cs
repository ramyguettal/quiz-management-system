using Dodo.Primitives;
using quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;
using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Domain.AcademicYearFolder;

public class AcademicYear : AggregateRoot
{
    public string Number { get; private set; } = string.Empty;

    private readonly List<Course> _courses = new();
    public IReadOnlyList<Course> Courses => _courses.AsReadOnly();

    private AcademicYear() { } // EF Core

    public AcademicYear(Guid id, string name) : base(id)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Academic year name cannot be empty.");

        Number = name;
    }
    public static Result<AcademicYear> Create(Guid id, string name)
    {
        string[] allowed = { "Y1", "Y2", "Y3", "Y4" };

        if (!allowed.Contains(name))
            return Result.Failure<AcademicYear>(
                DomainError.InvalidState(nameof(AcademicYear), "Academic Year must be Y1, Y2, Y3 or Y4.")
            );

        if (id == Guid.Empty)
            return Result.Failure<AcademicYear>(
                DomainError.InvalidState(nameof(AcademicYear), "Id cannot be empty")
            );

        return Result.Success(new AcademicYear(id, name));
    }

    public Result AddCourse(Guid id, string title)
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