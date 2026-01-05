using System;
using System.Collections.Generic;
using System.Text;

namespace quiz_management_system.Domain.UserSubmission.Helper;

public static class TextSimilarityCalculator
{
    public static decimal CalculateSimilarity(string answer, string expected)
    {
        if (string.IsNullOrWhiteSpace(answer) || string.IsNullOrWhiteSpace(expected))
            return 0;

        // Normalize both strings
        string normalizedAnswer = Normalize(answer);
        string normalizedExpected = Normalize(expected);

        // Exact match
        if (normalizedAnswer == normalizedExpected)
            return 1.0m;

        // Calculate multiple similarity metrics and combine
        decimal levenshteinScore = CalculateLevenshteinSimilarity(normalizedAnswer, normalizedExpected);
        decimal tokenScore = CalculateTokenSimilarity(normalizedAnswer, normalizedExpected);
        decimal containsScore = CalculateContainmentSimilarity(normalizedAnswer, normalizedExpected);

        // Weighted average (Levenshtein 40%, Token 40%, Contains 20%)
        decimal finalScore = (levenshteinScore * 0.4m) + (tokenScore * 0.4m) + (containsScore * 0.2m);

        return Math.Round(finalScore, 4);
    }

    private static string Normalize(string text)
    {
        return text.Trim()
            .ToLowerInvariant()
            .Replace("  ", " ")
            .Replace(".", "")
            .Replace(",", "")
            .Replace("!", "")
            .Replace("?", "");
    }

    private static decimal CalculateLevenshteinSimilarity(string s1, string s2)
    {
        int distance = LevenshteinDistance(s1, s2);
        int maxLength = Math.Max(s1.Length, s2.Length);

        if (maxLength == 0) return 1.0m;

        return 1.0m - ((decimal)distance / maxLength);
    }

    private static int LevenshteinDistance(string s1, string s2)
    {
        int[,] d = new int[s1.Length + 1, s2.Length + 1];

        for (int i = 0; i <= s1.Length; i++)
            d[i, 0] = i;

        for (int j = 0; j <= s2.Length; j++)
            d[0, j] = j;

        for (int j = 1; j <= s2.Length; j++)
        {
            for (int i = 1; i <= s1.Length; i++)
            {
                int cost = s1[i - 1] == s2[j - 1] ? 0 : 1;
                d[i, j] = Math.Min(
                    Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                    d[i - 1, j - 1] + cost);
            }
        }

        return d[s1.Length, s2.Length];
    }

    private static decimal CalculateTokenSimilarity(string s1, string s2)
    {
        var tokens1 = s1.Split(' ', StringSplitOptions.RemoveEmptyEntries).ToHashSet();
        var tokens2 = s2.Split(' ', StringSplitOptions.RemoveEmptyEntries).ToHashSet();

        if (tokens1.Count == 0 && tokens2.Count == 0) return 1.0m;
        if (tokens1.Count == 0 || tokens2.Count == 0) return 0m;

        int commonTokens = tokens1.Intersect(tokens2).Count();
        int totalUniqueTokens = tokens1.Union(tokens2).Count();

        return (decimal)commonTokens / totalUniqueTokens;
    }

    private static decimal CalculateContainmentSimilarity(string s1, string s2)
    {
        // Check if shorter string is contained in longer
        string shorter = s1.Length < s2.Length ? s1 : s2;
        string longer = s1.Length < s2.Length ? s2 : s1;

        if (longer.Contains(shorter))
            return 0.9m; // High score if fully contained

        // Check word-by-word containment
        var shorterWords = shorter.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        int containedWords = shorterWords.Count(word => longer.Contains(word));

        if (shorterWords.Length == 0) return 0m;

        return (decimal)containedWords / shorterWords.Length * 0.7m;
    }
}