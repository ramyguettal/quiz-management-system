using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Domain.QuizesFolder.Abstraction;

public abstract class QuizQuestion : Entity
{
    public Guid QuizId { get; protected set; }
    public Quiz Quiz { get; protected set; } = default!;

    public string Text { get; protected set; } = string.Empty;
    public int Points { get; protected set; }
    public int Order { get; protected set; }


    protected QuizQuestion() { } // EF Core

    protected QuizQuestion(
        Guid id,
        Quiz quiz,
        string text,
        int points,
        int order
      )
        : base(id)
    {
        Quiz = quiz;
        QuizId = quiz.Id;

        Text = text;
        Points = points;
        Order = order;


    }

    protected static Result ValidateCommon(
        Quiz quiz,
        string text,
        int points,
        int order)

    {
        if (quiz is null)
            return Result.Failure(
                DomainError.InvalidState(nameof(QuizQuestion), "Quiz is required."));

        if (string.IsNullOrWhiteSpace(text))
            return Result.Failure(
                DomainError.InvalidState(nameof(QuizQuestion), "Question text is required."));

        if (points <= 0)
            return Result.Failure(
                DomainError.InvalidState(nameof(QuizQuestion), "Points must be greater than zero."));

        if (order <= 0)
            return Result.Failure(
                DomainError.InvalidState(nameof(QuizQuestion), "Order must be greater than zero."));



        return Result.Success();
    }

    public Result UpdateText(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return Result.Failure(
                DomainError.InvalidState(nameof(QuizQuestion), "Question text is required."));

        Text = text;
        return Result.Success();
    }

    public Result UpdatePoints(int points)
    {
        if (points <= 0)
            return Result.Failure(
                DomainError.InvalidState(nameof(QuizQuestion), "Points must be greater than zero."));

        Points = points;
        return Result.Success();
    }


    public void SetOrder(int order)
    {
        Order = order;
    }


}