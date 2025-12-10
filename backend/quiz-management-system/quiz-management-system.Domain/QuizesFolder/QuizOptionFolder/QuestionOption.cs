using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;

namespace quiz_management_system.Domain.QuizesFolder.QuizOptionFolder;

public sealed class QuestionOption : Entity
{
    public Guid QuestionId { get; private set; }
    public MultipleChoiceQuestion Question { get; private set; } = default!;

    public string Text { get; private set; } = string.Empty;
    public bool IsCorrect { get; private set; }

    private QuestionOption() { } // EF Core

    private QuestionOption(Guid id, MultipleChoiceQuestion question, string text, bool isCorrect)
        : base(id)
    {
        Question = question;
        QuestionId = question.Id;

        Text = text;
        IsCorrect = isCorrect;
    }

    internal static QuestionOption Create(MultipleChoiceQuestion question, string text, bool isCorrect)
    {
        Guid id = Guid.CreateVersion7();
        return new QuestionOption(id, question, text, isCorrect);
    }
}

