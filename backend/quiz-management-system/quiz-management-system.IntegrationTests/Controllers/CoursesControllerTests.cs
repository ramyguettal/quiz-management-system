using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using quiz_management_system.Domain.AcademicYearFolder;
using quiz_management_system.Infrastructure.Data;
using quiz_management_system.IntegrationTests.Fixtures;

namespace quiz_management_system.IntegrationTests.Controllers;

public class CoursesControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public CoursesControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Test");
    }

    [Fact]
    public async Task GetCourses_ShouldReturn200_WithCoursesList()
    {
        // Act
        var response = await _client.GetAsync("/api/courses");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task CreateCourse_ShouldReturn401_WhenNotAuthenticated()
    {
        // Arrange
        _client.DefaultRequestHeaders.Authorization = null;
        var courseRequest = new
        {
            Title = "Test Course",
            Description = "Test Description",
            Code = "TEST001",
            AcademicYearId = Guid.NewGuid()
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/courses", courseRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
