using Makayen.Infrastructure.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Domain.AcademicYearFolder;
using quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;
using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.Identity;
using quiz_management_system.Domain.GroupFolder;
using quiz_management_system.Domain.Users.Abstraction.AppearancePreferencesFolder;
using quiz_management_system.Domain.Users.Abstraction.NotificationPreferencesFolder;
using quiz_management_system.Domain.Users.AdminFolder;
using quiz_management_system.Domain.Users.InstructorsFolders;
using quiz_management_system.Domain.Users.StudentsFolder;

namespace quiz_management_system.Infrastructure.Data;

public class AppDbContext
    : IdentityDbContext<ApplicationUser, ApplicationRole, string>, IAppDbContext
{
    private readonly IPublisher _mediator;

    public AppDbContext(
        DbContextOptions<AppDbContext> options,
        IPublisher mediator
    ) : base(options)
    {
        _mediator = mediator;
    }




    // ----------------------------
    // Identity
    // ----------------------------
    public DbSet<ApplicationUser> IdentityUsers => Set<ApplicationUser>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // ----------------------------
    // Users
    // ----------------------------
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Instructor> Instructors => Set<Instructor>();
    public DbSet<Admin> Admins => Set<Admin>();

    // ----------------------------
    // Value Objects as Entities
    // ----------------------------
    public DbSet<AppearancePreferences> AppearancePreferences => Set<AppearancePreferences>();
    public DbSet<NotificationPreferences> NotificationPreferences => Set<NotificationPreferences>();

    // ----------------------------
    // Academic Year / Courses
    // ----------------------------
    public DbSet<AcademicYear> AcademicYears => Set<AcademicYear>();
    public DbSet<Course> Courses => Set<Course>();

    // ----------------------------
    // Groups + Join Tables
    // ----------------------------
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<InstructorCourse> InstructorCourses => Set<InstructorCourse>();
    public DbSet<GroupInstructor> GroupInstructors => Set<GroupInstructor>();
    public DbSet<GroupStudent> GroupStudents => Set<GroupStudent>();

    // ----------------------------
    // Auditing
    // ----------------------------
    public bool DisableAuditing { get; set; } = false;




    // ----------------------------
    // SaveChanges with domain events
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
            await _mediator.Publish(domainEvent, cancellationToken);

        foreach (var entity in domainEntities)
            entity.ClearDomainEvents();
    }

    // ----------------------------
    // Model configuration
    // ----------------------------
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }


}
