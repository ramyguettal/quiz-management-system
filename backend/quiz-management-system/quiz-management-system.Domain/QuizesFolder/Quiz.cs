using quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;
using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Events;
using quiz_management_system.Domain.GroupFolder;
using quiz_management_system.Domain.QuizesFolder.Abstraction;
using quiz_management_system.Domain.QuizesFolder.Enums;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;
using quiz_management_system.Domain.QuizesFolder.QuizGroupFolder;

namespace quiz_management_system.Domain.QuizesFolder;

public sealed class Quiz : AggregateRoot, IAuditable
{
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;

    public Guid CourseId { get; private set; }
    public Course Course { get; private set; } = default!;

    // Availability window (no global time limit / attempts)
    public DateTimeOffset AvailableFromUtc { get; private set; }
    public DateTimeOffset? AvailableToUtc { get; private set; }

    // Settings
    public bool ShuffleQuestions { get; private set; }
    public bool ShowResultsImmediately { get; private set; }
    public bool AllowEditAfterSubmission { get; private set; }

    // Lifecycle
    public QuizStatus Status { get; private set; } = QuizStatus.Draft;
    public bool ResultsReleased { get; private set; }

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

    // Questions
    private readonly List<QuizQuestion> _questions = new();
    public IReadOnlyCollection<QuizQuestion> Questions => _questions.AsReadOnly();

    // Which groups are included in this quiz
    private readonly List<QuizGroup> _groups = new();
    public IReadOnlyCollection<QuizGroup> Groups => _groups.AsReadOnly();

    private Quiz() { } // EF Core

    private Quiz(
        Guid id,
        Course course,
        string title,
        string description,
        DateTimeOffset availableFromUtc,
        DateTimeOffset? availableToUtc,
        bool shuffleQuestions,
        bool showResultsImmediately,
        bool allowEditAfterSubmission)
        : base(id)
    {
        Course = course;
        CourseId = course.Id;

        Title = title;
        Description = description ?? string.Empty;

        AvailableFromUtc = availableFromUtc;
        AvailableToUtc = availableToUtc;

        ShuffleQuestions = shuffleQuestions;
        ShowResultsImmediately = showResultsImmediately;
        AllowEditAfterSubmission = allowEditAfterSubmission;

        Status = QuizStatus.Draft;

        AddDomainEvent(new QuizCreatedEvent(id));
    }

    public static Result<Quiz> Create(
        Guid id,
        Course course,
        string title,
        string description,
        DateTimeOffset availableFromUtc,
        DateTimeOffset? availableToUtc,
        bool shuffleQuestions,
        bool showResultsImmediately,
        bool allowEditAfterSubmission)
    {
        if (id == Guid.Empty)
            return Result.Failure<Quiz>(
                DomainError.InvalidState(nameof(Quiz), "Id cannot be empty."));

        if (course is null)
            return Result.Failure<Quiz>(
                DomainError.InvalidState(nameof(Quiz), "Course is required."));

        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure<Quiz>(
                DomainError.InvalidState(nameof(Quiz), "Title is required."));

        if (availableToUtc.HasValue && availableToUtc < availableFromUtc)
            return Result.Failure<Quiz>(
                DomainError.InvalidState(nameof(Quiz), "AvailableTo cannot be before AvailableFrom."));

        Quiz quiz = new Quiz(
            id,
            course,
            title,
            description,
            availableFromUtc,
            availableToUtc,
            shuffleQuestions,
            showResultsImmediately,
            allowEditAfterSubmission);

        return Result.Success(quiz);
    }

    #region Settings

    public Result UpdateBasicInfo(string title, string description)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure(
                DomainError.InvalidState(nameof(Quiz), "Title is required."));

        Title = title;
        Description = description ?? string.Empty;

        return Result.Success();
    }

    public Result UpdateAvailability(DateTimeOffset fromUtc, DateTimeOffset? toUtc)
    {
        if (toUtc.HasValue && toUtc < fromUtc)
            return Result.Failure(
                DomainError.InvalidState(nameof(Quiz), "AvailableTo cannot be before AvailableFrom."));

        AvailableFromUtc = fromUtc;
        AvailableToUtc = toUtc;

        return Result.Success();
    }

    public void SetShuffleQuestions(bool value)
    {
        ShuffleQuestions = value;
    }

    public Result EnableImmediateResults()
    {


        ShowResultsImmediately = true;
        return Result.Success();
    }

    public void DisableImmediateResults()
    {
        ShowResultsImmediately = false;
    }

    public void SetAllowEditAfterSubmission(bool value)
    {
        AllowEditAfterSubmission = value;
    }

    #endregion

    #region Lifecycle

    public Result Publish()
    {
        if (Status != QuizStatus.Draft)
            return Result.Failure(
                DomainError.InvalidState(nameof(Quiz),
                    "Only draft quizzes can be published."));

        if (!_questions.Any())
            return Result.Failure(
                DomainError.InvalidState(nameof(Quiz),
                    "Cannot publish a quiz without questions."));

        if (!_groups.Any())
            return Result.Failure(
                DomainError.InvalidState(nameof(Quiz),
                    "Cannot publish a quiz without assigned groups."));

        Status = QuizStatus.Published;
        AddDomainEvent(new QuizPublishedEvent(Id));
        return Result.Success();
    }

    public Result Close()
    {
        if (Status != QuizStatus.Published)
            return Result.Failure(
                DomainError.InvalidState(nameof(Quiz), "Only published quizzes can be closed."));

        Status = QuizStatus.Closed;
        AddDomainEvent(new QuizClosedEvent(Id));

        return Result.Success();
    }

    // Called by grading page when all attempts are graded
    public Result ReleaseResults()
    {
        if (Status != QuizStatus.Closed)
            return Result.Failure(
                DomainError.InvalidState(nameof(Quiz), "Results can only be released after the quiz is closed."));

        if (ResultsReleased)
            return Result.Success();

        ResultsReleased = true;
        AddDomainEvent(new QuizResultsReleasedEvent(Id));

        return Result.Success();
    }

    #endregion

    #region Groups

    public Result AddGroup(Group group)
    {
        if (group is null)
            return Result.Failure(
                DomainError.InvalidState(nameof(Group), "Group cannot be null."));

        if (_groups.Any(g => g.GroupId == group.Id))
            return Result.Success();

        _groups.Add(QuizGroup.Create(this, group));
        return Result.Success();
    }

    public Result RemoveGroup(Group group)
    {
        if (group is null)
            return Result.Success();

        QuizGroup? link = _groups.FirstOrDefault(g => g.GroupId == group.Id);
        if (link is null)
            return Result.Success();

        _groups.Remove(link);
        return Result.Success();
    }

    #endregion

    #region Questions helpers

    public Result<MultipleChoiceQuestion> AddMultipleChoiceQuestion(
        string text,
        int points,
        bool isTimed,
        int? timeLimitInMinutes,
        bool shuffleOptions)
    {
        int order = _questions.Count + 1;

        Result<MultipleChoiceQuestion> result = MultipleChoiceQuestion.Create(
            Guid.CreateVersion7(),
            this,
            text,
            points,
            order,
            isTimed,
            timeLimitInMinutes,
            shuffleOptions);

        if (result.IsFailure)
            return Result.Failure<MultipleChoiceQuestion>(result.TryGetError());

        MultipleChoiceQuestion question = result.TryGetValue();
        _questions.Add(question);

        return Result.Success(question);
    }

    public Result<ShortAnswerQuestion> AddShortAnswerQuestion(
        string text,
        int points,
        bool isTimed,
        int? timeLimitInMinutes,
        string? expectedAnswer)
    {
        int order = _questions.Count + 1;

        Result<ShortAnswerQuestion> result = ShortAnswerQuestion.Create(
            Guid.CreateVersion7(),
            this,
            text,
            points,
            order,
            isTimed,
            timeLimitInMinutes,
            expectedAnswer);

        if (result.IsFailure)
            return Result.Failure<ShortAnswerQuestion>(result.TryGetError());

        ShortAnswerQuestion question = result.TryGetValue();
        _questions.Add(question);

        return Result.Success(question);
    }

    #endregion
}
