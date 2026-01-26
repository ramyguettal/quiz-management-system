using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;
using quiz_management_system.Domain.UserSubmission.Answers.Abstraction;

namespace quiz_management_system.Domain.UserSubmission.Answers;

public sealed class MultipleChoiceAnswer : QuestionAnswer
{
    private readonly List<OptionAnswer> _selectedOptions = new();
    public IReadOnlyCollection<OptionAnswer> SelectedOptions => _selectedOptions.AsReadOnly();

    private MultipleChoiceAnswer() { } // EF Core

    private MultipleChoiceAnswer(
        Guid id,
        QuizSubmission submission,
        MultipleChoiceQuestion question)
        : base(id, submission, question)
    {
    }

    public static Result<MultipleChoiceAnswer> Create(
        Guid id,
        QuizSubmission submission,
        MultipleChoiceQuestion question,
        List<Guid> selectedOptionIds)
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

        if (selectedOptionIds == null || !selectedOptionIds.Any())
            return Result.Failure<MultipleChoiceAnswer>(
                DomainError.InvalidState(nameof(MultipleChoiceAnswer),
                    "At least one option must be selected."));

        var answer = new MultipleChoiceAnswer(id, submission, question);

        // Add each selected option
        var distinctOptionIds = selectedOptionIds.Distinct().ToList();
        foreach (var optionId in distinctOptionIds)
        {
            var option = question.Options.FirstOrDefault(o => o.Id == optionId);
            if (option == null)
                return Result.Failure<MultipleChoiceAnswer>(
                    DomainError.InvalidState(nameof(MultipleChoiceAnswer),
                        $"Option {optionId} does not belong to this question."));

            var optionAnswer = OptionAnswer.Create(answer, option);
            answer._selectedOptions.Add(optionAnswer);
        }

        return Result.Success(answer);
    }

    public void Grade()
    {
        var mcQuestion = (MultipleChoiceQuestion)Question;

        // Grade each option selection
        foreach (var optionAnswer in _selectedOptions)
        {
            optionAnswer.Grade();
        }

        // Get correct options from question
        var correctOptionIds = mcQuestion.Options
            .Where(o => o.IsCorrect)
            .Select(o => o.Id)
            .ToHashSet();

        var selectedOptionIds = _selectedOptions
            .Select(o => o.SelectedOptionId)
            .ToHashSet();

        // Check if answer is completely correct
        // Student must select ALL correct options and NO incorrect options
        bool hasAllCorrect = correctOptionIds.All(id => selectedOptionIds.Contains(id));
        bool hasNoIncorrect = selectedOptionIds.All(id => correctOptionIds.Contains(id));

        IsCorrect = hasAllCorrect && hasNoIncorrect;

        // Calculate partial credit based on correctness
        if (IsCorrect)
        {
            // Full points if completely correct
            PointsEarned = QuestionPoints;
        }
        else
        {
            // Partial credit: (correct selections / total correct options) * points
            int correctSelections = _selectedOptions.Count(o => o.IsCorrect);
            int totalCorrectOptions = correctOptionIds.Count;
            int incorrectSelections = _selectedOptions.Count(o => !o.IsCorrect);

            if (totalCorrectOptions > 0)
            {
                // Award points proportionally, but penalize incorrect selections
                decimal baseScore = (decimal)correctSelections / totalCorrectOptions;
                decimal penalty = (decimal)incorrectSelections / mcQuestion.Options.Count;

                PointsEarned = Math.Max(0, (baseScore - penalty) * QuestionPoints);
                PointsEarned = Math.Round(PointsEarned, 2);
            }
            else
            {
                PointsEarned = 0;
            }
        }
    }
}