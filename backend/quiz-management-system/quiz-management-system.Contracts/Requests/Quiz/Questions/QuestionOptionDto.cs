namespace quiz_management_system.Contracts.Requests.Quiz.Questions;

public record QuestionOptionDto(
    string Text,
    bool IsCorrect
);