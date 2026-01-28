using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Infrastructure.Data;
using quiz_management_system.Infrastructure.Data.Interceptors;

namespace quiz_management_system.IntegrationTests.Fixtures;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly string _databaseName = Guid.NewGuid().ToString();

    public CustomWebApplicationFactory()
    {
        // 1. Set Environment to "Testing"
        // This triggers checks in DependencyInjection.cs to SKIP registering real Npgsql DB and Hangfire.
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Testing");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // 2. Add InMemory Database
   
            services.AddDbContext<AppDbContext>((sp, options) =>
                options
                    .UseInMemoryDatabase(_databaseName)
                    .AddInterceptors(
                        sp.GetRequiredService<CreatableEntityInterceptor>(),
                        sp.GetRequiredService<UpdatableEntityInterceptor>(),
                        sp.GetRequiredService<SoftDeleteEntityInterceptor>())
            );

            // 3. Add Test Authentication Scheme
            // Allows tests to bypass auth by using "Authorization: Test" header
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = TestAuthHandler.AuthenticationScheme;
                options.DefaultChallengeScheme = TestAuthHandler.AuthenticationScheme;
            })
            .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.AuthenticationScheme, options => { });
        });
    }

    public async Task InitializeAsync()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Ensure clean InMemory DB exists
        await db.Database.EnsureCreatedAsync();

        // Seed basic data (Y1-Y4)
        var initializer = scope.ServiceProvider.GetRequiredService<IDbInitializer>();
        await initializer.SeedAsync();
    }

    public new async Task DisposeAsync()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        // Cleanup InMemory DB
        await db.Database.EnsureDeletedAsync();
        
        await base.DisposeAsync();
    }
}