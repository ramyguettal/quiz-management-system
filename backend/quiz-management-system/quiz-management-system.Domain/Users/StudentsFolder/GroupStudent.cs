using Dodo.Primitives;
using quiz_management_system.Domain.GroupFolder;

namespace quiz_management_system.Domain.Users.StudentsFolder;

public sealed class GroupStudent
{
    public Uuid GroupId { get; private set; }
    public Group Group { get; private set; }

    public Uuid StudentId { get; private set; }
    public Student Student { get; private set; }

    private GroupStudent() { } // EF Core

    private GroupStudent(Group group, Student student)
    {
        Group = group;
        GroupId = group.Id;

        Student = student;
        StudentId = student.Id;
    }

    public static GroupStudent Create(Group group, Student student)
        => new GroupStudent(group, student);
}
