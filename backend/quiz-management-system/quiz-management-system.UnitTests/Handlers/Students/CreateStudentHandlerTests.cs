using FluentAssertions;
using Moq;
using quiz_management_system.Application.Dtos;
using quiz_management_system.Application.Features.CreateStudent;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Student;
using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.UnitTests.Common;

namespace quiz_management_system.UnitTests.Handlers.Students;

public class CreateStudentHandlerTests : IDisposable
{
    private readonly Infrastructure.Data.AppDbContext _context;
    private readonly Mock<IIdentityService> _identityServiceMock;
    private readonly Mock<IActivityService> _activityServiceMock;
    private readonly Mock<IUserContext> _userContextMock;
    private readonly CreateStudentHandler _handler;

    public CreateStudentHandlerTests()
    {
        _context = TestDbContextFactory.Create();
        _identityServiceMock = new Mock<IIdentityService>();
        _activityServiceMock = new Mock<IActivityService>();
        _userContextMock = new Mock<IUserContext>();

        _userContextMock.Setup(x => x.UserId).Returns(Guid.NewGuid());
        _userContextMock.Setup(x => x.UserRole).Returns("Admin");

        _handler = new CreateStudentHandler(
            _identityServiceMock.Object,
            _context,
            _activityServiceMock.Object,
            _userContextMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldCreateStudent_WhenValidRequest()
    {
        // Arrange
        var year = FakeDataGenerator.CreateAcademicYear("Y1");
        var group = FakeDataGenerator.CreateGroup(year, "G1");
        
        _context.AcademicYears.Add(year);
        _context.Groups.Add(group);
        await _context.SaveChangesAsync(CancellationToken.None);

        var identityId = Guid.NewGuid();
        var registration = new IdentityRegistrationResult(
            IdentityUserId: identityId.ToString(),
            FullName: "John Doe",
            Email: "john.doe@example.com",
            Role: "Student");

        _identityServiceMock
            .Setup(x => x.CreateIdentityByEmailAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(registration));

        var command = new CreateStudentCommand(
            Email: "john.doe@example.com",
            FullName: "John Doe",
            AcademicYear: "Y1",
            GroupNumber: "G1");

        // Act
        Result<StudentResponse> result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.TryGetValue().FullName.Should().Be("John Doe");
        result.TryGetValue().Email.Should().Be("john.doe@example.com");

        var savedStudent = _context.Students.FirstOrDefault(s => s.Email == "john.doe@example.com");
        savedStudent.Should().NotBeNull();

        _activityServiceMock.Verify(
            x => x.LogActivityAsync(
                ActivityType.StudentCreated,
                It.IsAny<Guid>(),
                It.IsAny<string>(),
                It.Is<string>(s => s.Contains("John Doe")),
                It.IsAny<Guid>(),
                "Student",
                "John Doe",
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldFail_WhenAcademicYearNotFound()
    {
        // Arrange
        var identityId = Guid.NewGuid();
        var registration = new IdentityRegistrationResult(
            IdentityUserId: identityId.ToString(),
            FullName: "Jane Doe",
            Email: "jane.doe@example.com",
            Role: "Student");

        _identityServiceMock
            .Setup(x => x.CreateIdentityByEmailAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(registration));

        var command = new CreateStudentCommand(
            Email: "jane.doe@example.com",
            FullName: "Jane Doe",
            AcademicYear: "NonExistent Year",
            GroupNumber: "G1");

        // Act
        Result<StudentResponse> result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.TryGetError().Description.Should().Contain("AcademicYear");
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
