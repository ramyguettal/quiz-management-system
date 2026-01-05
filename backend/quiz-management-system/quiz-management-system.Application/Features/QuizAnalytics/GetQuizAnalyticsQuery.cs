using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.QuizAnalytics.DTOs;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder;
using quiz_management_system.Domain.UserSubmission.Enums;

namespace quiz_management_system.Application.QuizAnalytics.Queries;

// Query
public sealed record GetQuizAnalyticsQuery(Guid QuizId) : IRequest<Result<QuizAnalyticsResponse>>;

// Handler
public sealed class GetQuizAnalyticsQueryHandler(IAppDbContext context)
    : IRequestHandler<GetQuizAnalyticsQuery, Result<QuizAnalyticsResponse>>
{
    // Constants for grading thresholds
    private const decimal PASS_THRESHOLD_PERCENTAGE = 50m;
    private const decimal GRADE_A_THRESHOLD = 90m;
    private const decimal GRADE_B_THRESHOLD = 80m;
    private const decimal GRADE_C_THRESHOLD = 70m;
    private const decimal GRADE_D_THRESHOLD = 60m;

    // Constants for difficulty calculation
    private const decimal EASY_THRESHOLD = 80m;
    private const decimal MEDIUM_THRESHOLD = 60m;

    // Constants for text formatting
    private const int QUESTION_TEXT_MAX_LENGTH = 50;
    private const string DATE_FORMAT = "yyyy-MM-dd HH:mm";
    private const string EMPTY_DATE_PLACEHOLDER = "—";

    public async Task<Result<QuizAnalyticsResponse>> Handle(
        GetQuizAnalyticsQuery request,
        CancellationToken cancellationToken)
    {
        // Verify quiz exists (lightweight query)
        var quiz = await context.Quizzes
            .AsNoTracking()
            .Where(q => q.Id == request.QuizId)
            .Select(q => new { q.Id })
            .FirstOrDefaultAsync(cancellationToken);

        if (quiz is null)
            return Result.Failure<QuizAnalyticsResponse>(
                DomainError.NotFound(nameof(Quiz), request.QuizId));

        // Get all submissions for this quiz
        var allSubmissions = await context.QuizSubmissions
            .AsNoTracking()
            .Include(s => s.Student)
            .Where(s => s.QuizId == request.QuizId)
            .ToListAsync(cancellationToken);

        // Filter graded submissions in memory (already loaded)
        var gradedSubmissions = allSubmissions
            .Where(s => s.Status == SubmissionStatus.Graded)
            .ToList();

        // Calculate statistics
        var statistics = CalculateStatistics(allSubmissions, gradedSubmissions);

        // Map student submissions
        var studentSubmissions = allSubmissions
            .Select(MapToStudentSubmission)
            .OrderByDescending(s => s.SubmittedAt)
            .ToList();

        // Get question analysis
        var questionAnalysis = await GetQuestionAnalysis(request.QuizId, cancellationToken);

        // Calculate score distribution
        var scoreDistribution = CalculateScoreDistribution(gradedSubmissions);

        var response = new QuizAnalyticsResponse
        {
            Statistics = statistics,
            StudentSubmissions = studentSubmissions,
            QuestionAnalysis = questionAnalysis,
            ScoreDistribution = scoreDistribution
        };

        return Result.Success(response);
    }

    private static QuizStatistics CalculateStatistics(
        List<Domain.UserSubmission.QuizSubmission> allSubmissions,
        List<Domain.UserSubmission.QuizSubmission> gradedSubmissions)
    {
        int totalSubmissions = allSubmissions.Count;

        // Average score (only from graded submissions, out of 20)
        decimal averageScore = gradedSubmissions.Any()
            ? Math.Round(gradedSubmissions.Average(s => s.ScaledScore), 0)
            : 0;

        // Pass rate: percentage of graded students with >= PASS_THRESHOLD_PERCENTAGE
        decimal passRate = gradedSubmissions.Any()
            ? Math.Round(
                (decimal)gradedSubmissions.Count(s => s.Percentage >= PASS_THRESHOLD_PERCENTAGE)
                / gradedSubmissions.Count * 100, 0)
            : 0;

        // Completion rate: graded / total submissions
        decimal completionRate = allSubmissions.Any()
            ? Math.Round((decimal)gradedSubmissions.Count / allSubmissions.Count * 100, 0)
            : 0;

        return new QuizStatistics
        {
            TotalSubmissions = totalSubmissions,
            AverageScore = averageScore,
            PassRate = passRate,
            CompletionRate = completionRate
        };
    }

    private static StudentSubmissionDto MapToStudentSubmission(
        Domain.UserSubmission.QuizSubmission submission)
    {
        // Calculate time spent in minutes
        int timeSpent = 0;
        if (submission.SubmittedAtUtc.HasValue)
        {
            var duration = submission.SubmittedAtUtc.Value - submission.StartedAtUtc;
            timeSpent = (int)Math.Round(duration.TotalMinutes);
        }

        // Format submitted date
        string formattedDate = submission.SubmittedAtUtc.HasValue
            ? FormatSubmissionDate(submission.SubmittedAtUtc.Value)
            : EMPTY_DATE_PLACEHOLDER;

        return new StudentSubmissionDto
        {
            SubmissionId = submission.Id,
            StudentName = submission.Student.FullName,
            StudentEmail = submission.Student.Email,
            StudentId = submission.StudentId.ToString(),
            SubmittedAt = formattedDate,
            Score = submission.ScaledScore,
            Percentage = Math.Round(submission.Percentage, 0),
            TimeSpent = timeSpent,
            Status = submission.Status
        };
    }

    private static string FormatSubmissionDate(DateTimeOffset dateTime)
    {
        return dateTime.ToString(DATE_FORMAT);
    }

    private async Task<List<QuestionAnalysisDto>> GetQuestionAnalysis(
        Guid quizId,
        CancellationToken cancellationToken)
    {
        // Load all questions for this quiz
        var questions = await context.QuizQuestions
            .AsNoTracking()
            .Where(q => q.QuizId == quizId)
            .Select(q => new { q.Id, q.Text })
            .ToListAsync(cancellationToken);

        if (!questions.Any())
            return new List<QuestionAnalysisDto>();

        var questionIds = questions.Select(q => q.Id).ToHashSet();

        // Load all answers for these questions in ONE query
        var allAnswers = await context.QuestionAnswers
            .AsNoTracking()
            .Where(a => questionIds.Contains(a.QuestionId))
            .Select(a => new { a.QuestionId, a.IsCorrect })
            .ToListAsync(cancellationToken);

        // Group answers by question ID for efficient lookup
        var answersByQuestion = allAnswers
            .GroupBy(a => a.QuestionId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var questionAnalysis = new List<QuestionAnalysisDto>();

        foreach (var question in questions)
        {
            // Get answers for this question from the dictionary
            var hasAnswers = answersByQuestion.TryGetValue(question.Id, out var answers);

            if (!hasAnswers || answers is null || !answers.Any())
            {
                questionAnalysis.Add(new QuestionAnalysisDto
                {
                    QuestionId = question.Id,
                    QuestionText = TruncateText(question.Text, QUESTION_TEXT_MAX_LENGTH),
                    SuccessRate = 0,
                    Difficulty = "N/A"
                });
                continue;
            }

            // Calculate success rate (percentage of correct answers)
            var correctAnswers = answers.Count(a => a.IsCorrect);
            decimal successRate = Math.Round((decimal)correctAnswers / answers.Count * 100, 0);

            // Determine difficulty based on success rate
            string difficulty = successRate switch
            {
                >= EASY_THRESHOLD => "Easy",
                >= MEDIUM_THRESHOLD => "Medium",
                _ => "Hard"
            };

            questionAnalysis.Add(new QuestionAnalysisDto
            {
                QuestionId = question.Id,
                QuestionText = TruncateText(question.Text, QUESTION_TEXT_MAX_LENGTH),
                SuccessRate = successRate,
                Difficulty = difficulty
            });
        }

        return questionAnalysis;
    }

    private static ScoreDistribution CalculateScoreDistribution(
        List<Domain.UserSubmission.QuizSubmission> gradedSubmissions)
    {
        int gradeA = 0, gradeB = 0, gradeC = 0, gradeD = 0, gradeF = 0;

        foreach (var submission in gradedSubmissions)
        {
            var percentage = submission.Percentage;

            if (percentage >= GRADE_A_THRESHOLD)
                gradeA++;
            else if (percentage >= GRADE_B_THRESHOLD)
                gradeB++;
            else if (percentage >= GRADE_C_THRESHOLD)
                gradeC++;
            else if (percentage >= GRADE_D_THRESHOLD)
                gradeD++;
            else
                gradeF++;
        }

        return new ScoreDistribution(
            gradeA,
            gradeB,
            gradeC,
            gradeD,
            gradeF
        );
    }

    private static string TruncateText(string text, int maxLength)
    {
        if (string.IsNullOrEmpty(text))
            return string.Empty;

        return text.Length <= maxLength
            ? text
            : string.Concat(text.AsSpan(0, maxLength), "...");
    }
}