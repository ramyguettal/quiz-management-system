namespace quiz_management_system.Domain.Common;

/// <summary>
/// Represents the type of activity that was performed in the system.
/// </summary>
public enum ActivityType
{
    // User Management
    StudentCreated = 1,
    InstructorCreated = 2,
    AdminCreated = 3,
    UserDeactivated = 4,
    UserActivated = 5,

    // Quiz Operations
    QuizCreated = 10,
    QuizUpdated = 11,
    QuizPublished = 12,
    QuizDeleted = 13,

    // Course Management
    InstructorCoursesUpdated = 20
}
