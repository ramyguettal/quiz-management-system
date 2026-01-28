using Bogus;
using quiz_management_system.Domain.AcademicYearFolder;
using quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;
using quiz_management_system.Domain.GroupFolder;
using quiz_management_system.Domain.QuizesFolder;
using quiz_management_system.Domain.Users.StudentsFolder;

namespace quiz_management_system.UnitTests.Common;

public static class FakeDataGenerator
{
    private static readonly Faker Faker = new();
    private static readonly string[] AcademicYearNames = { "Y1", "Y2", "Y3", "Y4" };

    public static AcademicYear CreateAcademicYear(string? number = null)
    {
        // Academic year name must be Y1, Y2, Y3, or Y4
        var yearName = number ?? Faker.PickRandom(AcademicYearNames);
        
        // Validate that the year name is valid
        if (!AcademicYearNames.Contains(yearName))
        {
            yearName = "Y1"; // Default to Y1 if invalid
        }
        
        var result = AcademicYear.Create(Guid.NewGuid(), yearName);
        
        if (result.IsFailure)
        {
            throw new InvalidOperationException(
                $"Failed to create AcademicYear '{yearName}': {result.TryGetError().Description}");
        }
        
        return result.TryGetValue();
    }

    public static Course CreateCourse(AcademicYear year, string? title = null, string? code = null)
    {
        var result = Course.Create(
            Guid.NewGuid(),
            title ?? Faker.Commerce.ProductName(),
            Faker.Lorem.Sentence(),
            code ?? Faker.Random.AlphaNumeric(6).ToUpper(),
            year);

        if (result.IsFailure)
        {
            throw new InvalidOperationException(
                $"Failed to create Course: {result.TryGetError().Description}");
        }
        
        return result.TryGetValue();
    }

    public static Group CreateGroup(AcademicYear year, string? groupNumber = null)
    {
        var result = Group.Create(
            Guid.NewGuid(),
            groupNumber ?? Faker.Random.Number(1, 10).ToString());

        if (result.IsFailure)
        {
            throw new InvalidOperationException(
                $"Failed to create Group: {result.TryGetError().Description}");
        }
        
        var group = result.TryGetValue();
        group.UpdateAcademicYear(year);
        return group;
    }

    public static Quiz CreateQuiz(Course course, string? title = null)
    {
        var result = Quiz.Create(
            Guid.NewGuid(),
            course,
            title ?? Faker.Lorem.Sentence(3),
            Faker.Lorem.Paragraph(),
            DateTimeOffset.UtcNow,
            DateTimeOffset.UtcNow.AddDays(7),
            shuffleQuestions: false,
            showResultsImmediately: true,
            allowEditAfterSubmission: false);

        if (result.IsFailure)
        {
            throw new InvalidOperationException(
                $"Failed to create Quiz: {result.TryGetError().Description}");
        }
        
        return result.TryGetValue();
    }

    public static Student CreateStudent(AcademicYear year, Guid? identityId = null)
    {
        var result = Student.Create(
            identityId ?? Guid.NewGuid(),
            Faker.Name.FullName(),
            Faker.Internet.Email(),
            year);

        if (result.IsFailure)
        {
            throw new InvalidOperationException(
                $"Failed to create Student: {result.TryGetError().Description}");
        }
        
        return result.TryGetValue();
    }

    public static string Email() => Faker.Internet.Email();
    public static string FullName() => Faker.Name.FullName();
    public static string CourseCode() => Faker.Random.AlphaNumeric(6).ToUpper();
    public static string CourseTitle() => Faker.Commerce.ProductName();
}
