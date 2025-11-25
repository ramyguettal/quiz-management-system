using Dodo.Primitives;
using quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;

namespace quiz_management_system.Domain.Users.InstructorsFolders;

public sealed class InstructorCourse
{
    public Guid InstructorId { get; private set; }
    public Instructor Instructor { get; private set; }

    public Guid CourseId { get; private set; }
    public Course Course { get; private set; }

    private InstructorCourse() { } // EF Core

    private InstructorCourse(Instructor instructor, Course course)
    {
        Instructor = instructor;
        InstructorId = instructor.Id;

        Course = course;
        CourseId = course.Id;
    }

    public static InstructorCourse Create(Instructor instructor, Course course)
        => new InstructorCourse(instructor, course);
}