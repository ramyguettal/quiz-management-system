using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using quiz_management_system.Domain.AcademicYearFolder;
using quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;
using quiz_management_system.Domain.Files;
using quiz_management_system.Domain.GroupFolder;
using quiz_management_system.Domain.QuizesFolder;
using quiz_management_system.Domain.QuizesFolder.Abstraction;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;
using quiz_management_system.Domain.QuizesFolder.QuizGroupFolder;
using quiz_management_system.Domain.QuizesFolder.QuizOptionFolder;
using quiz_management_system.Domain.Users.Abstraction;
using quiz_management_system.Domain.Users.AdminFolder;
using quiz_management_system.Domain.Users.InstructorsFolders;
using quiz_management_system.Domain.Users.StudentsFolder;
using quiz_management_system.Domain.UserSubmission;
using quiz_management_system.Domain.UserSubmission.Answers;
using quiz_management_system.Domain.UserSubmission.Answers.Abstraction;

public interface IAppDbContext
{
    bool DisableCreationAudit { get; set; }
    bool DisableUpdateAudit { get; set; }
    bool DisableSoftDeleting { get; set; }
    bool DisableDomainEvents { get; set; }


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


    #region  Notifications
    DbSet<DomainNotification> Notifications { get; }
    #endregion

    #region Quiz System (New)
    DbSet<Quiz> Quizzes { get; }
    DbSet<QuizQuestion> QuizQuestions { get; }

    DbSet<MultipleChoiceQuestion> MultipleChoiceQuestions { get; }
    DbSet<ShortAnswerQuestion> ShortAnswerQuestions { get; }

    DbSet<QuestionOption> QuestionOptions { get; }
    DbSet<QuizGroup> QuizGroups { get; }
    #endregion


    #region Files
    DbSet<UploadedFile> UploadedFiles { get; }
    #endregion


    #region Quiz Submissions

    DbSet<QuizSubmission> QuizSubmissions { get; }

    DbSet<QuestionAnswer> QuestionAnswers { get; }
    DbSet<MultipleChoiceAnswer> MultipleChoiceAnswers { get; }
    DbSet<ShortAnswer> ShortAnswers { get; }
    DbSet<OptionAnswer> OptionAnswers { get; }

    #endregion

    #region Persistence
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    int SaveChanges();
    DatabaseFacade Database { get; }
    #endregion




}
