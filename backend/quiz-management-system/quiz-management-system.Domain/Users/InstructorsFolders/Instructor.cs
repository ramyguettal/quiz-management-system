using quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.GroupFolder;
using quiz_management_system.Domain.Users.Abstraction;

namespace quiz_management_system.Domain.Users.InstructorsFolders;

public sealed class Instructor : DomainUser
{
    private readonly List<InstructorCourse> _courses = new();
    public IReadOnlyList<InstructorCourse> Courses => _courses.AsReadOnly();

    private readonly List<GroupInstructor> _groups = new();
    public IReadOnlyList<GroupInstructor> Groups => _groups.AsReadOnly();

    private Instructor() : base() { } // EF Core

    public Instructor(Guid id, string fullName, string email)
        : base(id, fullName, email)
    {
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
