using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using quiz_management_system.Domain.AcademicYearFolder;
using quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;
using quiz_management_system.Domain.GroupFolder;
using quiz_management_system.Domain.QuizesFolder;
using quiz_management_system.Domain.QuizesFolder.Abstraction;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;
using quiz_management_system.Domain.QuizesFolder.QuizGroupFolder;
using quiz_management_system.Domain.QuizesFolder.QuizOptionFolder;
using quiz_management_system.Domain.Users.Abstraction;
using quiz_management_system.Domain.Users.Abstraction.NotificationPreferencesFolder;
using quiz_management_system.Domain.Users.AdminFolder;
using quiz_management_system.Domain.Users.InstructorsFolders;
using quiz_management_system.Domain.Users.StudentsFolder;

public interface IAppDbContext
{
    bool DisableCreationAudit { get; set; }
    bool DisableUpdateAudit { get; set; }
    bool DisableSoftDeleting { get; set; }


    #region Users
    DbSet<DomainUser> Users { get; }

    DbSet<Student> Students { get; }
    DbSet<Admin> Admins { get; }
    DbSet<Instructor> Instructors { get; }
    #endregion

    #region Academic Structure
    DbSet<AcademicYear> AcademicYears { get; }
    DbSet<Course> Courses { get; }
    DbSet<Group> Groups { get; }
    DbSet<InstructorCourse> InstructorCourses { get; }
    DbSet<GroupInstructor> GroupInstructors { get; }
    DbSet<GroupStudent> GroupStudents { get; }
    #endregion

    #region Notification Preferences
    DbSet<NotificationPreferences> NotificationPreferences { get; }
    #endregion

    #region Quiz System (New)
    DbSet<Quiz> Quizzes { get; }
    DbSet<QuizQuestion> QuizQuestions { get; }

    // TPC derived sets
    DbSet<MultipleChoiceQuestion> MultipleChoiceQuestions { get; }
    DbSet<ShortAnswerQuestion> ShortAnswerQuestions { get; }

    DbSet<QuestionOption> QuestionOptions { get; }
    DbSet<QuizGroup> QuizGroups { get; }
    #endregion

    #region Persistence
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    int SaveChanges();
    Task DispatchDomainEventsAsync(CancellationToken cancellationToken);
    DatabaseFacade Database { get; }
    #endregion
}
