using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.QuizesFolder.Abstraction;

namespace quiz_management_system.Domain.UserSubmission.Answers.Abstraction;

public abstract class QuestionAnswer : Entity
{
    public Guid SubmissionId { get; protected set; }
    public QuizSubmission Submission { get; protected set; } = default!;

    public Guid QuestionId { get; protected set; }
    public QuizQuestion Question { get; protected set; } = default!;

    public int QuestionPoints { get; protected set; }
    public decimal PointsEarned { get; protected set; }
    public bool IsCorrect { get; protected set; }

    public DateTimeOffset AnsweredAtUtc { get; protected set; }

    protected QuestionAnswer() { } // EF Core

    protected QuestionAnswer(
        Guid id,
        QuizSubmission submission,
        QuizQuestion question)
        : base(id)
    {
        Submission = submission;
        SubmissionId = submission.Id;

        Question = question;
        QuestionId = question.Id;
        QuestionPoints = question.Points;

        AnsweredAtUtc = DateTimeOffset.UtcNow;
    }
}



