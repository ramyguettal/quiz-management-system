namespace quiz_management_system.Contracts.Requests.Quiz.Questions;

public record UpdateMultipleChoiceQuestionRequest(
    string Text,
    int Points,
    bool IsTimed,
    int? TimeLimitInMinutes,
    bool ShuffleOptions,
    List<QuestionOptionDto> Options
);
