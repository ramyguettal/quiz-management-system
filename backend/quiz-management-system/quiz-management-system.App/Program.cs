
using Hangfire;
using HangfireBasicAuthenticationFilter;
using quiz_management_system.App;
using quiz_management_system.Application.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Register Presentation Layer (API + Infrastructure + Application)
builder.Services.AddPresentation(builder.Configuration);

var app = builder.Build();



app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Quiz Management System API v1");
    options.RoutePrefix = string.Empty; // Swagger at /
});



app.UseForwardedHeaders();



app.UseHangfireDashboard("/jobs", new DashboardOptions
{
    Authorization =
    [
        new HangfireCustomBasicAuthenticationFilter
        {
            User = app.Configuration["HangfireSettings:Username"],
            Pass = app.Configuration["HangfireSettings:Password"]
        }
    ]
});


using (var scope = app.Services.CreateScope())
{
    var initializer = scope.ServiceProvider.GetRequiredService<IDbInitializer>();
    await initializer.SeedAsync();
}



app.UseRouting();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
