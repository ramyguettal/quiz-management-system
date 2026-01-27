using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using quiz_management_system.IntegrationTests.Fixtures;

namespace quiz_management_system.IntegrationTests.Controllers;

public class GroupsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public GroupsControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Test");
    }

    [Fact]
    public async Task GetGroups_ShouldReturn200_WithEmptyList_WhenNoGroupsExist()
    {
        // Act
        var response = await _client.GetAsync("/api/groups");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task GetGroups_ShouldReturn200_WhenFilteringByYearId()
    {
        // Arrange
        var yearId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/groups?yearId={yearId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
