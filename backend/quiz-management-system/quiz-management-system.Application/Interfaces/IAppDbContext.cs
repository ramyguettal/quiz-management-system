using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using quiz_management_system.Domain.AcademicYearFolder;
using quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;
using quiz_management_system.Domain.GroupFolder;
using quiz_management_system.Domain.Users.Abstraction.AppearancePreferencesFolder;
using quiz_management_system.Domain.Users.Abstraction.NotificationPreferencesFolder;
using quiz_management_system.Domain.Users.AdminFolder;
using quiz_management_system.Domain.Users.InstructorsFolders;
using quiz_management_system.Domain.Users.StudentsFolder;

public interface IAppDbContext
{
    // Disable auditing temporarily
    bool DisableAuditing { get; set; }

    // User aggregates
    DbSet<Student> Students { get; }
    DbSet<Admin> Admins { get; }
    DbSet<Instructor> Instructors { get; }

    // Domain aggregates
    DbSet<AcademicYear> AcademicYears { get; }
    DbSet<Course> Courses { get; }
    DbSet<Group> Groups { get; }

    DbSet<AppearancePreferences> AppearancePreferences { get; }
    DbSet<NotificationPreferences> NotificationPreferences { get; }

    DbSet<InstructorCourse> InstructorCourses { get; }
    DbSet<GroupInstructor> GroupInstructors { get; }
    DbSet<GroupStudent> GroupStudents { get; }


    Task<int> SaveChangesAsync(CancellationToken cancellationToken);

    int SaveChanges();

    Task DispatchDomainEventsAsync(CancellationToken cancellationToken);

    // Transaction support
    DatabaseFacade Database { get; }
}
