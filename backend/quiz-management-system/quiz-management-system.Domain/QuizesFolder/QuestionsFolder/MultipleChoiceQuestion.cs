using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder.Abstraction;
using quiz_management_system.Domain.QuizesFolder.QuizOptionFolder;

namespace quiz_management_system.Domain.QuizesFolder.QuestionsFolder;

public sealed class MultipleChoiceQuestion : QuizQuestion
{
    public bool ShuffleOptions { get; private set; }

    private readonly List<QuestionOption> _options = new();
    public IReadOnlyCollection<QuestionOption> Options => _options.AsReadOnly();

    private MultipleChoiceQuestion() { } // EF Core

    private MultipleChoiceQuestion(
        Guid id,
        Quiz quiz,
        string text,
        int points,
        int order,


        bool shuffleOptions)
        : base(id, quiz, text, points, order)
    {
        ShuffleOptions = shuffleOptions;
    }

    public static Result<MultipleChoiceQuestion> Create(
        Guid id,
        Quiz quiz,
        string text,
        int points,
        int order,

        bool shuffleOptions)
    {
        Result validation = ValidateCommon(quiz, text, points, order);
        if (validation.IsFailure)
            return Result.Failure<MultipleChoiceQuestion>(validation.TryGetError());

        MultipleChoiceQuestion question = new MultipleChoiceQuestion(
            id,
            quiz,
            text,
            points,
            order,

            shuffleOptions);

        return Result.Success(question);
    }

    public void SetShuffleOptions(bool value)
    {
        ShuffleOptions = value;
    }

    public Result<QuestionOption> AddOption(string text, bool isCorrect)
    {
        if (string.IsNullOrWhiteSpace(text))
            return Result.Failure<QuestionOption>(
                DomainError.InvalidState(nameof(QuestionOption), "Option text is required."));

        QuestionOption option = QuestionOption.Create(this, text, isCorrect);
        _options.Add(option);

        return Result.Success(option);
    }

}