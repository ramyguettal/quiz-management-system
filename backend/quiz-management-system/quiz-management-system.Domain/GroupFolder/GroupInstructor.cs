using quiz_management_system.Domain.Users.InstructorsFolders;

namespace quiz_management_system.Domain.GroupFolder;

public sealed class GroupInstructor
{
    public Guid GroupId { get; private set; }
    public Group Group { get; private set; }

    public Guid InstructorId { get; private set; }
    public Instructor Instructor { get; private set; }

    private GroupInstructor() { }

    private GroupInstructor(Group group, Instructor instructor)
    {
        Group = group;
        GroupId = group.Id;

        Instructor = instructor;
        InstructorId = instructor.Id;
    }

    public static GroupInstructor Create(Group group, Instructor instructor)
        => new GroupInstructor(group, instructor);
}



