namespace quiz_management_system.Contracts.Requests.UserSubmissions;

/// <summary>
/// Filter for student submission status.
/// </summary>
public enum SubmissionStatusFilter
{
    /// <summary>
    /// Submitted quizzes where the quiz is not yet closed.
    /// </summary>
    Submitted,

    /// <summary>
    /// Submitted quizzes where the quiz is closed (results released).
    /// </summary>
    Released
}
