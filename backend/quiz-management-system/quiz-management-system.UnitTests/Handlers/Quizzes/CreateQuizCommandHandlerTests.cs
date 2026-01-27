using FluentAssertions;
using Moq;
using quiz_management_system.Application.Features.Quizzes.CreateQuiz;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.UnitTests.Common;

namespace quiz_management_system.UnitTests.Handlers.Quizzes;

public class CreateQuizCommandHandlerTests : IDisposable
{
    private readonly Infrastructure.Data.AppDbContext _context;
    private readonly Mock<IActivityService> _activityServiceMock;
    private readonly Mock<IUserContext> _userContextMock;
    private readonly CreateQuizCommandHandler _handler;

    public CreateQuizCommandHandlerTests()
    {
        _context = TestDbContextFactory.Create();
        _activityServiceMock = new Mock<IActivityService>();
        _userContextMock = new Mock<IUserContext>();

        _userContextMock.Setup(x => x.UserId).Returns(Guid.NewGuid());
        _userContextMock.Setup(x => x.UserRole).Returns("Instructor");

        _handler = new CreateQuizCommandHandler(
            _context,
            _activityServiceMock.Object,
            _userContextMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldCreateQuiz_WhenValidRequest()
    {
        // Arrange
        var academicYear = FakeDataGenerator.CreateAcademicYear("Y1");
        var course = FakeDataGenerator.CreateCourse(academicYear, "Programming", "PROG101");

        _context.AcademicYears.Add(academicYear);
        _context.Courses.Add(course);
        await _context.SaveChangesAsync(CancellationToken.None);

        var command = new CreateQuizCommand(
            CourseId: course.Id,
            Title: "Midterm Exam",
            Description: "Midterm examination for programming course",
            AvailableFromUtc: DateTimeOffset.UtcNow,
            AvailableToUtc: DateTimeOffset.UtcNow.AddDays(7),
            ShuffleQuestions: true,
            ShowResultsImmediately: false,
            AllowEditAfterSubmission: false,
            GroupIds: null);

        // Act
        Result<Guid> result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.TryGetValue().Should().NotBeEmpty();

        var savedQuiz = _context.Quizzes.FirstOrDefault(q => q.Title == "Midterm Exam");
        savedQuiz.Should().NotBeNull();
        savedQuiz!.CourseId.Should().Be(course.Id);

        _activityServiceMock.Verify(
            x => x.LogActivityAsync(
                ActivityType.QuizCreated,
                It.IsAny<Guid>(),
                It.IsAny<string>(),
                It.Is<string>(s => s.Contains("Midterm Exam")),
                It.IsAny<Guid>(),
                "Quiz",
                "Midterm Exam",
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldFail_WhenCourseNotFound()
    {
        // Arrange
        var command = new CreateQuizCommand(
            CourseId: Guid.NewGuid(), // Non-existent course
            Title: "Quiz",
            Description: "Test quiz",
            AvailableFromUtc: DateTimeOffset.UtcNow,
            AvailableToUtc: DateTimeOffset.UtcNow.AddDays(7),
            ShuffleQuestions: false,
            ShowResultsImmediately: true,
            AllowEditAfterSubmission: false,
            GroupIds: null);

        // Act
        Result<Guid> result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
