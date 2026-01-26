using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.QuizesFolder.QuizOptionFolder;

namespace quiz_management_system.Domain.UserSubmission.Answers;

public sealed class OptionAnswer : Entity
{
    public Guid MultipleChoiceAnswerId { get; private set; }
    public MultipleChoiceAnswer MultipleChoiceAnswer { get; private set; } = default!;

    public Guid SelectedOptionId { get; private set; }
    public QuestionOption SelectedOption { get; private set; } = default!;

    public bool IsCorrect { get; private set; }
    public DateTimeOffset SelectedAtUtc { get; private set; }

    private OptionAnswer() { } // EF Core

    private OptionAnswer(
        Guid id,
        MultipleChoiceAnswer multipleChoiceAnswer,
        QuestionOption selectedOption)
        : base(id)
    {
        MultipleChoiceAnswer = multipleChoiceAnswer;
        MultipleChoiceAnswerId = multipleChoiceAnswer.Id;

        SelectedOption = selectedOption;
        SelectedOptionId = selectedOption.Id;

        SelectedAtUtc = DateTimeOffset.UtcNow;
    }

    internal static OptionAnswer Create(
        MultipleChoiceAnswer multipleChoiceAnswer,
        QuestionOption selectedOption)
    {
        return new OptionAnswer(
            Guid.CreateVersion7(),
            multipleChoiceAnswer,
            selectedOption);
    }

    internal void Grade()
    {
        IsCorrect = SelectedOption.IsCorrect;
    }
}