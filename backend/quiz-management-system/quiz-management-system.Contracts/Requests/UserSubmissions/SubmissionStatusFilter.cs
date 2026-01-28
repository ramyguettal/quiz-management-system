namespace quiz_management_system.Contracts.Requests.UserSubmissions;

/// <summary>
/// Filter for student submission status.
/// </summary>
public enum SubmissionStatusFilter
{
    /// <summary>
    /// Quizzes that are currently in progress (not yet submitted).
    /// </summary>
    InProgress,

    /// <summary>
    /// Submitted quizzes where the quiz is not yet closed.
    /// </summary>
    Submitted,

    /// <summary>
    /// Submitted quizzes where the quiz is closed (results released).
    /// </summary>
    Released
}
