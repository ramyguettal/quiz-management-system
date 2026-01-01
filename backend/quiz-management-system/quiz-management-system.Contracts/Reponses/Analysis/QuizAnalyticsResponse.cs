using quiz_management_system.Domain.UserSubmission.Enums;

namespace quiz_management_system.Application.QuizAnalytics.DTOs;

// Main analytics response
public sealed record QuizAnalyticsResponse
{
    public QuizStatistics Statistics { get; init; } = default!;
    public List<StudentSubmissionDto> StudentSubmissions { get; init; } = new();
    public List<QuestionAnalysisDto> QuestionAnalysis { get; init; } = new();
    public ScoreDistribution ScoreDistribution { get; init; } = default!;
}

// Top-level statistics (the 4 cards)
public sealed record QuizStatistics
{
    public int TotalSubmissions { get; init; }
    public decimal AverageScore { get; init; } // Out of 20
    public decimal PassRate { get; init; } // Percentage
    public decimal CompletionRate { get; init; } // Percentage
}

// Student submission row
public sealed record StudentSubmissionDto
{
    public Guid SubmissionId { get; init; }
    public string StudentName { get; init; } = string.Empty;
    public string StudentEmail { get; init; } = string.Empty;
    public string StudentId { get; init; } = string.Empty; // Student registration number
    public string SubmittedAt { get; init; } = string.Empty; // Formatted date
    public decimal Score { get; init; } // Out of 20
    public decimal Percentage { get; init; }
    public int TimeSpent { get; init; } // In minutes
    public SubmissionStatus Status { get; init; } // "Graded", "Pending"
}
// Question analysis (right panel)
public sealed record QuestionAnalysisDto
{
    public Guid QuestionId { get; init; }
    public string QuestionText { get; init; } = string.Empty;
    public decimal SuccessRate { get; init; } // Percentage
    public string Difficulty { get; init; } = string.Empty; // "Easy", "Medium", "Hard"
}

// Score distribution
public sealed record ScoreDistribution(int GradeA, int GradeB, int GradeC, int GradeD, int GradeF);
