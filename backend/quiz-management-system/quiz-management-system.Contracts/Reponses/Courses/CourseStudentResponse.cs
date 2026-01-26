namespace quiz_management_system.Contracts.Reponses.Courses;

public sealed record CourseStudentResponse(
    Guid StudentId,
    string FullName,
    string Email,
    int QuizzesTaken
);