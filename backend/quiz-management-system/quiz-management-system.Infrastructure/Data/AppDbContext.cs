using MediatR;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Domain.AcademicYearFolder;
using quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;
using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.Identity;
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
using quiz_management_system.Infrastructure.Idenitity;

namespace quiz_management_system.Infrastructure.Data;

public class AppDbContext
    (DbContextOptions<AppDbContext> options, IPublisher mediator)
    : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>(options), IAppDbContext
{
    #region Flags

    public bool DisableCreationAudit { get; set; } = false;
    public bool DisableUpdateAudit { get; set; } = false;
    public bool DisableSoftDeleting { get; set; } = false;
    public bool DisableDomainEvents { get; set; } = false;

    #endregion

    #region Identity

    public DbSet<ApplicationUser> IdentityUsers => Set<ApplicationUser>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    #endregion

    #region Users

    public DbSet<DomainUser> Users => Set<DomainUser>();

    public DbSet<Student> Students => Set<Student>();
    public DbSet<Instructor> Instructors => Set<Instructor>();
    public DbSet<Admin> Admins => Set<Admin>();

    #endregion

    #region Academic Structure

    public DbSet<AcademicYear> AcademicYears => Set<AcademicYear>();
    public DbSet<Course> Courses => Set<Course>();

    #endregion

    #region Groups

    public DbSet<Group> Groups => Set<Group>();
    public DbSet<InstructorCourse> InstructorCourses => Set<InstructorCourse>();
    public DbSet<GroupInstructor> GroupInstructors => Set<GroupInstructor>();
    public DbSet<GroupStudent> GroupStudents => Set<GroupStudent>();

    #endregion

    #region Quiz System

    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();

    public DbSet<MultipleChoiceQuestion> MultipleChoiceQuestions => Set<MultipleChoiceQuestion>();
    public DbSet<ShortAnswerQuestion> ShortAnswerQuestions => Set<ShortAnswerQuestion>();

    public DbSet<QuestionOption> QuestionOptions => Set<QuestionOption>();
    public DbSet<QuizGroup> QuizGroups => Set<QuizGroup>();

    #endregion

    #region Quiz Submissions

    public DbSet<QuizSubmission> QuizSubmissions => Set<QuizSubmission>();
    public DbSet<OptionAnswer> OptionAnswers => Set<OptionAnswer>();

    public DbSet<QuestionAnswer> QuestionAnswers => Set<QuestionAnswer>();
    public DbSet<MultipleChoiceAnswer> MultipleChoiceAnswers => Set<MultipleChoiceAnswer>();
    public DbSet<ShortAnswer> ShortAnswers => Set<ShortAnswer>();

    #endregion

    #region Notifications

    public DbSet<DomainNotification> Notifications => Set<DomainNotification>();

    #endregion

    #region Files

    public DbSet<UploadedFile> UploadedFiles => Set<UploadedFile>();

    #endregion

    #region Recent Activities

    public DbSet<RecentActivity> RecentActivities => Set<RecentActivity>();

    #endregion

    #region SaveChanges & Domain Events

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        List<AggregateRoot> domainEntities = ChangeTracker.Entries()
            .Where(e => e.Entity is AggregateRoot root && root.DomainEvents.Count > 0)
            .Select(e => (AggregateRoot)e.Entity)
            .ToList();

        List<DomainEvent> domainEvents = domainEntities
            .SelectMany(e => e.DomainEvents)
            .ToList();

        int result = await base.SaveChangesAsync(cancellationToken);

        if (!DisableDomainEvents && domainEvents.Count > 0)
        {
            foreach (DomainEvent domainEvent in domainEvents)
            {
                await mediator.Publish(domainEvent, cancellationToken);
            }

            foreach (AggregateRoot entity in domainEntities)
            {
                entity.ClearDomainEvents();
            }
        }

        return result;
    }

    #endregion

    #region Model Configuration

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    #endregion
}
