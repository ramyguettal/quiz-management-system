namespace quiz_management_system.Contracts.Requests.UserSubmissions;

public record StartQuizSubmissionRequest
{
    /// <summary>
    /// The ID of the quiz to attempt
    /// </summary>
    public Guid QuizId { get; init; }

}


public record AnswerMultipleChoiceRequest
{
    /// <summary>
    /// The ID of the quiz submission
    /// </summary>
    public Guid SubmissionId { get; init; }

    /// <summary>
    /// The ID of the question being answered
    /// </summary>
    public Guid QuestionId { get; init; }

    /// <summary>
    /// The IDs of the selected options (can be one or many)
    /// </summary>
    public List<Guid> SelectedOptionIds { get; init; } = new();
}

public record AnswerShortAnswerRequest
{
    /// <summary>
    /// The ID of the quiz submission
    /// </summary>
    public Guid SubmissionId { get; init; }

    /// <summary>
    /// The ID of the question being answered
    /// </summary>
    public Guid QuestionId { get; init; }

    /// <summary>
    /// The student's answer text
    /// </summary>
    public string AnswerText { get; init; } = string.Empty;
}

public record MultipleChoiceAnswerItem
{
    public Guid QuestionId { get; init; }
    public Guid SelectedOptionId { get; init; }
}

public record ShortAnswerItem
{
    public Guid QuestionId { get; init; }
    public string AnswerText { get; init; } = string.Empty;
}
public record SubmitQuizRequest(Guid SubmissionId);