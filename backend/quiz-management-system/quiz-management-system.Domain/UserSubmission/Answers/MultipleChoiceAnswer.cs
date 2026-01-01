using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;
using quiz_management_system.Domain.QuizesFolder.QuizOptionFolder;
using quiz_management_system.Domain.UserSubmission.Answers.Abstraction;

namespace quiz_management_system.Domain.UserSubmission.Answers;

public sealed class MultipleChoiceAnswer : QuestionAnswer
{
    public Guid SelectedOptionId { get; private set; }
    public QuestionOption SelectedOption { get; private set; } = default!;

    private MultipleChoiceAnswer() { } // EF Core

    private MultipleChoiceAnswer(
        Guid id,
        QuizSubmission submission,
        MultipleChoiceQuestion question,
        Guid selectedOptionId)
        : base(id, submission, question)
    {
        SelectedOptionId = selectedOptionId;
    }

    public static Result<MultipleChoiceAnswer> Create(
        Guid id,
        QuizSubmission submission,
        MultipleChoiceQuestion question,
        Guid selectedOptionId)
    {
        if (id == Guid.Empty)
            return Result.Failure<MultipleChoiceAnswer>(
                DomainError.InvalidState(nameof(MultipleChoiceAnswer), "Id cannot be empty."));

        if (submission is null)
            return Result.Failure<MultipleChoiceAnswer>(
                DomainError.InvalidState(nameof(MultipleChoiceAnswer), "Submission is required."));

        if (question is null)
            return Result.Failure<MultipleChoiceAnswer>(
                DomainError.InvalidState(nameof(MultipleChoiceAnswer), "Question is required."));

        if (!question.Options.Any(o => o.Id == selectedOptionId))
            return Result.Failure<MultipleChoiceAnswer>(
                DomainError.InvalidState(nameof(MultipleChoiceAnswer),
                    "Selected option does not belong to this question."));

        var answer = new MultipleChoiceAnswer(id, submission, question, selectedOptionId);
        return Result.Success(answer);
    }

    public void Grade()
    {
        var selectedOption = ((MultipleChoiceQuestion)Question).Options
            .FirstOrDefault(o => o.Id == SelectedOptionId);

        if (selectedOption == null)
        {
            IsCorrect = false;
            PointsEarned = 0;
            return;
        }

        IsCorrect = selectedOption.IsCorrect;
        PointsEarned = IsCorrect ? QuestionPoints : 0;
    }
}
