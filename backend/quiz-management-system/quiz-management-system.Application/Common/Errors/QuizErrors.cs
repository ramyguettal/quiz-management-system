
using quiz_management_system.Domain.Common.ResultPattern.Error;
namespace quiz_management_system.Application.Common.Errors;

public sealed record QuizErrors(ApplicationErrorCode ApplicationErrorCode, string Type, string Description)
    : Error(ApplicationErrorCode, Type, Description)
{
    public static readonly QuizErrors None = new(
        ApplicationErrorCode.None,
        "Quiz.None",
        string.Empty);

    public static QuizErrors NotFound(Guid quizId) => new(
        ApplicationErrorCode.NotFound,
        "Quiz.NotFound",
        $"Quiz with ID '{quizId}' was not found.");

    public static QuizErrors HasSubmissions(string description = "Cannot delete quiz that has student submissions.") => new(
        ApplicationErrorCode.Conflict,
        "Quiz.HasSubmissions",
        description);

    public static QuizErrors AlreadyPublished(string description = "Cannot delete a published quiz.") => new(
        ApplicationErrorCode.Conflict,
        "Quiz.AlreadyPublished",
        description);

    public static QuizErrors InvalidStatus(string status) => new(
        ApplicationErrorCode.Validation,
        "Quiz.InvalidStatus",
        $"Invalid quiz status: '{status}'.");

    public static QuizErrors CourseNotFound(Guid courseId) => new(
        ApplicationErrorCode.NotFound,
        "Quiz.CourseNotFound",
        $"Course with ID '{courseId}' was not found.");

    public static QuizErrors InvalidDateRange(string description = "Available from date must be before available to date.") => new(
        ApplicationErrorCode.Validation,
        "Quiz.InvalidDateRange",
        description);

    public static QuizErrors AlreadyStarted(string description = "Cannot modify quiz that has already started.") => new(
        ApplicationErrorCode.Conflict,
        "Quiz.AlreadyStarted",
        description);

    public static QuizErrors NotAvailable(string description = "Quiz is not currently available for access.") => new(
        ApplicationErrorCode.BadRequest,
        "Quiz.NotAvailable",
        description);

    public static QuizErrors NoQuestions(string description = "Quiz must have at least one question before publishing.") => new(
        ApplicationErrorCode.Validation,
        "Quiz.NoQuestions",
        description);

    public static QuizErrors Unauthorized(string description = "You are not authorized to access this quiz.") => new(
        ApplicationErrorCode.Unauthorized,
        "Quiz.Unauthorized",
        description);

    public static QuizErrors TitleRequired(string description = "Quiz title is required.") => new(
        ApplicationErrorCode.Validation,
        "Quiz.TitleRequired",
        description);

    public static QuizErrors TitleTooLong(int maxLength = 200) => new(
        ApplicationErrorCode.Validation,
        "Quiz.TitleTooLong",
        $"Quiz title must not exceed {maxLength} characters.");

    public static QuizErrors DescriptionTooLong(int maxLength = 1000) => new(
        ApplicationErrorCode.Validation,
        "Quiz.DescriptionTooLong",
        $"Quiz description must not exceed {maxLength} characters.");

    public static QuizErrors InvalidPageSize(int min = 1, int max = 50) => new(
        ApplicationErrorCode.Validation,
        "Quiz.InvalidPageSize",
        $"Page size must be between {min} and {max}.");

    public static QuizErrors CourseRequired(string description = "Course ID is required.") => new(
        ApplicationErrorCode.Validation,
        "Quiz.CourseRequired",
        description);

    public static QuizErrors CannotModifyAfterSubmissions(string description = "Cannot modify quiz after students have submitted.") => new(
        ApplicationErrorCode.Conflict,
        "Quiz.CannotModifyAfterSubmissions",
        description);

    public static QuizErrors AlreadyArchived(string description = "Quiz is already archived.") => new(
        ApplicationErrorCode.Conflict,
        "Quiz.AlreadyArchived",
        description);

    public static QuizErrors InvalidDuration(string description = "Quiz duration must be greater than zero.") => new(
        ApplicationErrorCode.Validation,
        "Quiz.InvalidDuration",
        description);
}