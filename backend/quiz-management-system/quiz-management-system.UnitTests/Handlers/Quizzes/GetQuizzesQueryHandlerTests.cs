using FluentAssertions;
using quiz_management_system.Application.Features.Quizzes.GetAll;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Reponses.Quizzes;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.UnitTests.Common;

namespace quiz_management_system.UnitTests.Handlers.Quizzes;

public class GetQuizzesQueryHandlerTests : IDisposable
{
    private readonly Infrastructure.Data.AppDbContext _context;
    private readonly GetQuizzesQueryHandler _handler;

    public GetQuizzesQueryHandlerTests()
    {
        _context = TestDbContextFactory.Create();
        _handler = new GetQuizzesQueryHandler(_context);
    }

    [Fact]
    public async Task Handle_ShouldReturnPaginatedQuizzes_WhenQuizzesExist()
    {
        // Arrange
        var year = FakeDataGenerator.CreateAcademicYear("Y1");
        var course = FakeDataGenerator.CreateCourse(year, "Programming", "PROG101");
        
        var quiz1 = FakeDataGenerator.CreateQuiz(course, "Quiz 1");
        var quiz2 = FakeDataGenerator.CreateQuiz(course, "Quiz 2");
        var quiz3 = FakeDataGenerator.CreateQuiz(course, "Quiz 3");

        _context.AcademicYears.Add(year);
        _context.Courses.Add(course);
        _context.Quizzes.AddRange(quiz1, quiz2, quiz3);
        await _context.SaveChangesAsync(CancellationToken.None);

        var query = new GetQuizzesQuery(PageSize: 10);

        // Act
        Result<CursorPagedResponse<QuizListItemResponse>> result = 
            await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.TryGetValue().Items.Should().HaveCount(3);
    }

    [Fact]
    public async Task Handle_ShouldFilterByCourseId_WhenCourseIdProvided()
    {
        // Arrange
        var year = FakeDataGenerator.CreateAcademicYear("Y1");
        var course1 = FakeDataGenerator.CreateCourse(year, "Course 1", "C001");
        var course2 = FakeDataGenerator.CreateCourse(year, "Course 2", "C002");
        
        var quiz1 = FakeDataGenerator.CreateQuiz(course1, "Quiz for Course 1");
        var quiz2 = FakeDataGenerator.CreateQuiz(course2, "Quiz for Course 2");

        _context.AcademicYears.Add(year);
        _context.Courses.AddRange(course1, course2);
        _context.Quizzes.AddRange(quiz1, quiz2);
        await _context.SaveChangesAsync(CancellationToken.None);

        var query = new GetQuizzesQuery(CourseId: course1.Id);

        // Act
        Result<CursorPagedResponse<QuizListItemResponse>> result = 
            await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.TryGetValue().Items.Should().HaveCount(1);
        result.TryGetValue().Items.First().CourseName.Should().Be("Course 1");
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
