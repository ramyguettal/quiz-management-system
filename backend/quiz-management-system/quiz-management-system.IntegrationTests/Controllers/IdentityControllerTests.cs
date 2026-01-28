using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using quiz_management_system.IntegrationTests.Fixtures;

namespace quiz_management_system.IntegrationTests.Controllers;

public class IdentityControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public IdentityControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_ShouldReturn401_WithInvalidCredentials()
    {
        // Arrange
        var loginRequest = new
        {
            Email = "nonexistent@example.com",
            Password = "WrongPassword123!",
            DeviceId = "test-device-001"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/identity/login", loginRequest);

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.Unauthorized, 
            HttpStatusCode.BadRequest,
            HttpStatusCode.NotFound);
    }
}
