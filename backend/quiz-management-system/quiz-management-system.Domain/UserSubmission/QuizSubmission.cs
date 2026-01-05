using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Events;
using quiz_management_system.Domain.QuizesFolder;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;
using quiz_management_system.Domain.Users.StudentsFolder;
using quiz_management_system.Domain.UserSubmission.Answers;
using quiz_management_system.Domain.UserSubmission.Answers.Abstraction;
using quiz_management_system.Domain.UserSubmission.Enums;

namespace quiz_management_system.Domain.UserSubmission;

public sealed class QuizSubmission : AggregateRoot, IAuditable
{
    public Guid QuizId { get; private set; }
    public Quiz Quiz { get; private set; } = default!;

    public Guid StudentId { get; private set; }
    public Student Student { get; private set; } = default!;

    public DateTimeOffset StartedAtUtc { get; private set; }
    public DateTimeOffset? SubmittedAtUtc { get; private set; }
    public DateTimeOffset? GradedAtUtc { get; private set; }

    public SubmissionStatus Status { get; private set; } = SubmissionStatus.InProgress;



    // Scoring
    public decimal RawScore { get; private set; } // Actual points earned
    public decimal MaxScore { get; private set; } // Total possible points
    public decimal ScaledScore { get; private set; } // Out of 20
    public decimal Percentage { get; private set; } // 0-100%

    // Auditing
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public Guid CreatedBy { get; private set; } = Guid.Empty;
    public DateTimeOffset LastModifiedUtc { get; private set; }
    public Guid LastModifiedBy { get; private set; } = Guid.Empty;

    DateTimeOffset ICreatable.CreatedAtUtc
    {
        get => CreatedAtUtc;
        set => CreatedAtUtc = value;
    }

    Guid ICreatable.CreatedBy
    {
        get => CreatedBy;
        set => CreatedBy = value;
    }

    DateTimeOffset IUpdatable.LastModifiedUtc
    {
        get => LastModifiedUtc;
        set => LastModifiedUtc = value;
    }

    Guid IUpdatable.LastModifiedBy
    {
        get => LastModifiedBy;
        set => LastModifiedBy = value;
    }

    // Answers
    private readonly List<QuestionAnswer> _answers = new();
    public IReadOnlyCollection<QuestionAnswer> Answers => _answers.AsReadOnly();

    private QuizSubmission() { } // EF Core

    private QuizSubmission(
        Guid id,
        Quiz quiz,
        Student student,
        DateTimeOffset startedAtUtc)
        : base(id)
    {
        Quiz = quiz;
        QuizId = quiz.Id;

        Student = student;
        StudentId = student.Id;

        StartedAtUtc = startedAtUtc;
        Status = SubmissionStatus.InProgress;

        // Calculate max score from quiz questions
        MaxScore = quiz.Questions.Sum(q => q.Points);

        // AddDomainEvent(new QuizSubmissionStartedEvent(id, QuizId, StudentId));
    }

    public static Result<QuizSubmission> Create(
        Guid id,
        Quiz quiz,
        Student student)
    {
        if (id == Guid.Empty)
            return Result.Failure<QuizSubmission>(
                DomainError.InvalidState(nameof(QuizSubmission), "Id cannot be empty."));

        if (quiz is null)
            return Result.Failure<QuizSubmission>(
                DomainError.InvalidState(nameof(QuizSubmission), "Quiz is required."));

        if (student is null)
            return Result.Failure<QuizSubmission>(
                DomainError.InvalidState(nameof(QuizSubmission), "Student is required."));

        // Validate quiz is available
        DateTimeOffset now = DateTimeOffset.UtcNow;
        if (now < quiz.AvailableFromUtc)
            return Result.Failure<QuizSubmission>(
                DomainError.InvalidState(nameof(QuizSubmission), "Quiz is not yet available."));

        if (quiz.AvailableToUtc.HasValue && now > quiz.AvailableToUtc.Value)
            return Result.Failure<QuizSubmission>(
                DomainError.InvalidState(nameof(QuizSubmission), "Quiz is no longer available."));

        QuizSubmission submission = new QuizSubmission(id, quiz, student, now);

        return Result.Success(submission);
    }

    // ============================================================
    // ANSWER MANAGEMENT
    // ============================================================

    public Result<MultipleChoiceAnswer> AnswerMultipleChoice(
    MultipleChoiceQuestion question,
    List<Guid> selectedOptionIds)
    {
        if (selectedOptionIds == null || !selectedOptionIds.Any())
            return Result.Failure<MultipleChoiceAnswer>(
                DomainError.InvalidState(nameof(QuizSubmission),
                    "At least one option must be selected."));

        if (Status != SubmissionStatus.InProgress)
            return Result.Failure<MultipleChoiceAnswer>(
                DomainError.InvalidState(nameof(QuizSubmission),
                    "Cannot answer questions after submission."));

        if (!Quiz.Questions.Any(q => q.Id == question.Id))
            return Result.Failure<MultipleChoiceAnswer>(
                DomainError.InvalidState(nameof(QuizSubmission),
                    "Question does not belong to this quiz."));

        // Remove existing answer for this question if any
        var existingAnswer = _answers
            .OfType<MultipleChoiceAnswer>()
            .FirstOrDefault(a => a.QuestionId == question.Id);

        if (existingAnswer != null)
        {
            if (!Quiz.AllowEditAfterSubmission)
                return Result.Failure<MultipleChoiceAnswer>(
                    DomainError.InvalidState(nameof(QuizSubmission),
                        "Cannot change answer. Editing is not allowed."));

            _answers.Remove(existingAnswer);
        }

        var answerResult = MultipleChoiceAnswer.Create(
            Guid.CreateVersion7(),
            this,
            question,
            selectedOptionIds);

        if (answerResult.IsFailure)
            return answerResult;

        var answer = answerResult.TryGetValue();
        _answers.Add(answer);

        return Result.Success(answer);
    }



    public Result<ShortAnswer> AnswerShortAnswer(
        ShortAnswerQuestion question,
        string answerText)
    {
        if (Status != SubmissionStatus.InProgress)
            return Result.Failure<ShortAnswer>(
                DomainError.InvalidState(nameof(QuizSubmission),
                    "Cannot answer questions after submission."));

        if (!Quiz.Questions.Any(q => q.Id == question.Id))
            return Result.Failure<ShortAnswer>(
                DomainError.InvalidState(nameof(QuizSubmission),
                    "Question does not belong to this quiz."));

        // Check if already answered
        var existingAnswer = _answers.FirstOrDefault(a => a.QuestionId == question.Id);
        if (existingAnswer != null)
        {
            if (!Quiz.AllowEditAfterSubmission)
                return Result.Failure<ShortAnswer>(
                    DomainError.InvalidState(nameof(QuizSubmission),
                        "Cannot change answer. Editing is not allowed."));

            _answers.Remove(existingAnswer);
        }

        var answerResult = ShortAnswer.Create(
            Guid.CreateVersion7(),
            this,
            question,
            answerText);

        if (answerResult.IsFailure)
            return answerResult;

        _answers.Add(answerResult.TryGetValue());
        return answerResult;
    }

    // ============================================================
    // SUBMISSION & GRADING
    // ============================================================

    public Result Submit()
    {
        if (Status != SubmissionStatus.InProgress)
            return Result.Failure(
                DomainError.InvalidState(nameof(QuizSubmission),
                    "Submission has already been submitted."));

        SubmittedAtUtc = DateTimeOffset.UtcNow;
        Status = SubmissionStatus.Submitted;



        AddDomainEvent(new QuizSubmissionSubmittedEvent(Id, QuizId, StudentId));

        return Result.Success();
    }

    public Result Grade()
    {
        if (Status != SubmissionStatus.Submitted)
            return Result.Failure(
                DomainError.InvalidState(nameof(QuizSubmission),
                    "Can only grade submitted submissions."));

        decimal totalEarned = 0;

        foreach (var answer in _answers)
        {
            if (answer is MultipleChoiceAnswer mcAnswer)
            {
                mcAnswer.Grade();
                totalEarned += mcAnswer.PointsEarned;
            }
            else if (answer is ShortAnswer saAnswer)
            {
                saAnswer.Grade();
                totalEarned += saAnswer.PointsEarned;
            }
        }

        RawScore = totalEarned;

        // Calculate percentage
        Percentage = MaxScore > 0 ? (RawScore / MaxScore) * 100 : 0;

        // Scale to 20
        ScaledScore = MaxScore > 0 ? (RawScore / MaxScore) * 20 : 0;
        ScaledScore = Math.Round(ScaledScore, 2);

        GradedAtUtc = DateTimeOffset.UtcNow;
        Status = SubmissionStatus.Graded;

        //AddDomainEvent(new QuizSubmissionGradedEvent(Id, QuizId, StudentId, ScaledScore));

        return Result.Success();
    }
}