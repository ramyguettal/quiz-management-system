using FluentAssertions;
using quiz_management_system.Application.Features.Courses.Queries.GetAllCourses;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.UnitTests.Common;

namespace quiz_management_system.UnitTests.Handlers.Courses;

public class GetAllCoursesHandlerTests : IDisposable
{
    private readonly Infrastructure.Data.AppDbContext _context;
    private readonly GetAllCoursesHandler _handler;

    public GetAllCoursesHandlerTests()
    {
        _context = TestDbContextFactory.Create();
        _handler = new GetAllCoursesHandler(_context);
    }

    [Fact]
    public async Task Handle_ShouldReturnAllCourses_WhenCoursesExist()
    {
        // Arrange
        var year1 = FakeDataGenerator.CreateAcademicYear("Year 1");
        var year2 = FakeDataGenerator.CreateAcademicYear("Year 2");
        
        var course1 = FakeDataGenerator.CreateCourse(year1, "Course 1", "C001");
        var course2 = FakeDataGenerator.CreateCourse(year1, "Course 2", "C002");
        var course3 = FakeDataGenerator.CreateCourse(year2, "Course 3", "C003");

        _context.AcademicYears.AddRange(year1, year2);
        _context.Courses.AddRange(course1, course2, course3);
        await _context.SaveChangesAsync(CancellationToken.None);

        var query = new GetAllCoursesQuery();

        // Act
        Result<IReadOnlyList<CourseResponse>> result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.TryGetValue().Should().HaveCount(3);
        result.TryGetValue().Select(c => c.Code).Should().Contain(new[] { "C001", "C002", "C003" });
    }

    [Fact]
    public async Task Handle_ShouldReturnEmptyList_WhenNoCoursesExist()
    {
        // Arrange
        var query = new GetAllCoursesQuery();

        // Act
        Result<IReadOnlyList<CourseResponse>> result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.TryGetValue().Should().BeEmpty();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
