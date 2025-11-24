using Dodo.Primitives;
using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.InstructorsFolders;
using quiz_management_system.Domain.Users.StudentsFolder;

namespace quiz_management_system.Domain.GroupFolder;





public sealed class Group : AggregateRoot
{
    public string Name { get; private set; } = string.Empty;

    private readonly List<GroupInstructor> _instructors = new();
    public IReadOnlyList<GroupInstructor> Instructors => _instructors.AsReadOnly();

    private readonly List<GroupStudent> _students = new();
    public IReadOnlyList<GroupStudent> Students => _students.AsReadOnly();

    private Group() { } // EF Core

    public Group(Uuid id, string name) : base(id)
    {
        Name = name;
    }

    public static Result<Group> Create(Uuid id, string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<Group>(
                DomainError.InvalidState(nameof(Group), "Group name cannot be empty")
            );
        if (id == Uuid.Empty)
            return Result.Failure<Group>(
                DomainError.InvalidState(nameof(Group), "Id cannot be empty")
            );

        return Result.Success(new Group(id, name));
    }
    public Result AddInstructor(Instructor instructor)
    {
        if (instructor is null)
            return Result.Failure(DomainError.InvalidState(nameof(Instructor), "Instructor cannot be null"));

        if (_instructors.Any(x => x.InstructorId == instructor.Id))
            return Result.Success();

        _instructors.Add(GroupInstructor.Create(this, instructor));
        return Result.Success();
    }

    public Result AddStudent(Student student)
    {
        if (student is null)
            return Result.Failure(DomainError.InvalidState(nameof(Student), "Student cannot be null"));

        if (_students.Any(x => x.StudentId == student.Id))
            return Result.Success();

        _students.Add(GroupStudent.Create(this, student));
        return Result.Success();
    }

    public Result RemoveStudent(Student student)
    {
        var link = _students.FirstOrDefault(x => x.StudentId == student.Id);
        if (link is null)
            return Result.Success();

        _students.Remove(link);
        return Result.Success();
    }
}