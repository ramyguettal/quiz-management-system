using quiz_management_system.Contracts.Requests;

namespace quiz_management_system.Contracts.Reponses.QuizSubmissions;


public record SubmissionDetailResponse(
    Guid SubmissionId,
    Guid QuizId,
    string QuizTitle,
    Guid StudentId,
    string StudentName,
    DateTimeOffset StartedAtUtc,
    string Status,
    decimal MaxScore,
    List<AnswerDto> Answers
);

public record AnswerDto(
    Guid AnswerId,
    Guid QuestionId,
    string QuestionType, // "MultipleChoice" or "ShortAnswer"
    DateTimeOffset AnsweredAtUtc,
    List<Guid>? SelectedOptionIds, // For MultipleChoice (can be multiple)
    string? AnswerText // For ShortAnswer
);

// ============================================================
// SUBMISSION RESULT RESPONSE (After grading)
// ============================================================

public record SubmissionResultResponse(
    Guid SubmissionId,
    Guid QuizId,
    string QuizTitle,
    Guid StudentId,
    string StudentName,
    DateTimeOffset StartedAtUtc,
    DateTimeOffset SubmittedAtUtc,
    DateTimeOffset GradedAtUtc,
    decimal RawScore,
    decimal MaxScore,
    decimal ScaledScore, // Out of 20
    decimal Percentage,
    List<AnswerResultDto> AnswerResults
);

public record AnswerResultDto(
    Guid QuestionId,
    string QuestionText,
    string QuestionType,
    int QuestionPoints,
    decimal PointsEarned,
    bool IsCorrect,
    // For Multiple Choice
    List<Guid>? SelectedOptionIds,
    List<SelectedOptionDetail>? SelectedOptions,
    // For Short Answer
    string? StudentAnswerText,
    decimal? SimilarityScore, // For short answers
                              // Correct answers
    List<Guid>? CorrectOptionIds,
    List<CorrectOptionDetail>? CorrectOptions,
    string? ExpectedAnswerText
);

public record SelectedOptionDetail(
    Guid OptionId,
    string OptionText,
    bool IsCorrect
);

public record CorrectOptionDetail(
    Guid OptionId,
    string OptionText
);

// ============================================================
// SUBMISSION EDIT RESPONSE (Quiz with pre-filled answers)
// ============================================================

public record SubmissionEditResponse(
    Guid SubmissionId,
    Guid QuizId,
    string QuizTitle,
    string QuizDescription,
    DateTimeOffset StartedAtUtc,
    bool AllowEditAfterSubmission,
    List<QuestionWithAnswerDto> Questions
);

public record QuestionWithAnswerDto(
    Guid QuestionId,
    string QuestionType,
    string Text,
    int Points,
    int Order,
    List<StudentOptionDto>? Options, // For MultipleChoice
    string? ExpectedAnswer, // For ShortAnswer (for instructor view only)

    List<Guid>? CurrentSelectedOptionIds, // For MultipleChoice (can be multiple)
    string? CurrentAnswerText // For ShortAnswer
);
