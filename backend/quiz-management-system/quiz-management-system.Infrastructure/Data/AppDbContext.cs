using MediatR;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Domain.AcademicYearFolder;
using quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;
using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.Identity;
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
using quiz_management_system.Infrastructure.Idenitity;

namespace quiz_management_system.Infrastructure.Data;

public class AppDbContext
    (DbContextOptions<AppDbContext> options, IPublisher mediator) : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>(options), IAppDbContext
{

    public bool DisableCreationAudit { get; set; } = false;
    public bool DisableUpdateAudit { get; set; } = false;




    public DbSet<ApplicationUser> IdentityUsers => Set<ApplicationUser>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // ----------------------------
    // Users
    // ----------------------------
    public DbSet<DomainUser> Users => Set<DomainUser>();

    public DbSet<Student> Students => Set<Student>();
    public DbSet<Instructor> Instructors => Set<Instructor>();
    public DbSet<Admin> Admins => Set<Admin>();

    // ----------------------------
    // Settings
    // ----------------------------
    public DbSet<NotificationPreferences> NotificationPreferences => Set<NotificationPreferences>();

    // ----------------------------
    // Academic Structure
    // ----------------------------
    public DbSet<AcademicYear> AcademicYears => Set<AcademicYear>();
    public DbSet<Course> Courses => Set<Course>();

    // ----------------------------
    // Groups
    // ----------------------------
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<InstructorCourse> InstructorCourses => Set<InstructorCourse>();
    public DbSet<GroupInstructor> GroupInstructors => Set<GroupInstructor>();
    public DbSet<GroupStudent> GroupStudents => Set<GroupStudent>();

    // ----------------------------
    // Quiz System
    // ----------------------------
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
    public DbSet<MultipleChoiceQuestion> MultipleChoiceQuestions => Set<MultipleChoiceQuestion>();
    public DbSet<ShortAnswerQuestion> ShortAnswerQuestions => Set<ShortAnswerQuestion>();
    public DbSet<QuestionOption> QuestionOptions => Set<QuestionOption>();
    public DbSet<QuizGroup> QuizGroups => Set<QuizGroup>();


    // ----------------------------
    // SaveChanges + Domain Events
    // ----------------------------
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await DispatchDomainEventsAsync(cancellationToken);
        return await base.SaveChangesAsync(cancellationToken);
    }

    public async Task DispatchDomainEventsAsync(CancellationToken cancellationToken)
    {
        var domainEntities = ChangeTracker.Entries()
            .Where(x => x.Entity is AggregateRoot root && root.DomainEvents.Any())
            .Select(x => (AggregateRoot)x.Entity)
            .ToList();

        var events = domainEntities
            .SelectMany(x => x.DomainEvents)
            .ToList();

        foreach (var domainEvent in events)
            await mediator.Publish(domainEvent, cancellationToken);

        domainEntities.ForEach(e => e.ClearDomainEvents());
    }

    // ----------------------------
    // Model Configs
    // ----------------------------
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Automatically load all configurations in assembly
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }



}
