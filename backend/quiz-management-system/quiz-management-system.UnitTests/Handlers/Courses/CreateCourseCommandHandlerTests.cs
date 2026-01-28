using FluentAssertions;
using Microsoft.Extensions.Caching.Memory;
using quiz_management_system.Application.Features.Courses.Commands.CreateCourse;
using quiz_management_system.Contracts.Reponses.Courses;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.UnitTests.Common;

namespace quiz_management_system.UnitTests.Handlers.Courses;

public class CreateCourseCommandHandlerTests : IDisposable
{
    private readonly Infrastructure.Data.AppDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly CreateCourseCommandHandler _handler;

    public CreateCourseCommandHandlerTests()
    {
        _context = TestDbContextFactory.Create();
        _cache = new MemoryCache(new MemoryCacheOptions());
        _handler = new CreateCourseCommandHandler(_cache, _context);
    }

    [Fact]
    public async Task Handle_ShouldCreateCourse_WhenValidRequest()
    {
        // Arrange
        var academicYear = FakeDataGenerator.CreateAcademicYear("Y1");
        _context.AcademicYears.Add(academicYear);
        await _context.SaveChangesAsync(CancellationToken.None);

        var command = new CreateCourseCommand(
            Title: "Introduction to Programming",
            Description: "Learn the basics of programming",
            Code: "CS101",
            AcademicYearId: academicYear.Id);

        // Act
        Result<CourseResponse> result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.TryGetValue().Title.Should().Be("Introduction to Programming");
        result.TryGetValue().Code.Should().Be("CS101");

        var savedCourse = _context.Courses.FirstOrDefault(c => c.Code == "CS101");
        savedCourse.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_ShouldFail_WhenCourseCodeAlreadyExists()
    {
        // Arrange
        var academicYear = FakeDataGenerator.CreateAcademicYear("Y1");
        var existingCourse = FakeDataGenerator.CreateCourse(academicYear, "Existing Course", "CS101");
        
        _context.AcademicYears.Add(academicYear);
        _context.Courses.Add(existingCourse);
        await _context.SaveChangesAsync(CancellationToken.None);

        var command = new CreateCourseCommand(
            Title: "New Course",
            Description: "A new course",
            Code: "CS101", // Same code as existing
            AcademicYearId: academicYear.Id);

        // Act
        Result<CourseResponse> result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.TryGetError().Description.Should().Contain("already exists");
    }

    [Fact]
    public async Task Handle_ShouldFail_WhenAcademicYearNotFound()
    {
        // Arrange
        var command = new CreateCourseCommand(
            Title: "Introduction to Programming",
            Description: "Learn the basics",
            Code: "CS101",
            AcademicYearId: Guid.NewGuid()); // Non-existent year

        // Act
        Result<CourseResponse> result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.TryGetError().Description.Should().Contain("AcademicYear");
    }

    public void Dispose()
    {
        _context.Dispose();
        _cache.Dispose();
    }
}
