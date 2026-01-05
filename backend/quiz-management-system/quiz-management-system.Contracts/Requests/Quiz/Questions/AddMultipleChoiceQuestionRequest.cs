namespace quiz_management_system.Contracts.Requests.Quiz.Questions;

public record AddMultipleChoiceQuestionRequest(
    string Text,
    int Points,
    List<QuestionOptionDto> Options
);
