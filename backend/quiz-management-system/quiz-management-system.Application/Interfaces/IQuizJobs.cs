namespace quiz_management_system.Application.Interfaces;

/// <summary>
/// Job interface for quiz started notification.
/// </summary>
public interface IQuizStartedJob
{
    Task ExecuteAsync(Guid quizId, CancellationToken cancellationToken);
}

/// <summary>
/// Job interface for quiz auto-close.
/// </summary>
public interface IQuizAutoCloseJob
{
    Task ExecuteAsync(Guid quizId, CancellationToken cancellationToken);
}
