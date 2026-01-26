namespace quiz_management_system.Contracts.Requests.Quiz.Questions;

public record AddShortAnswerQuestionRequest(
    string Text,
    int Points,
    string? ExpectedAnswer
);
