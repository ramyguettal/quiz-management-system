using MediatR;
using Microsoft.EntityFrameworkCore;
using Moq;
using quiz_management_system.Infrastructure.Data;

namespace quiz_management_system.UnitTests.Common;

public static class TestDbContextFactory
{
    public static AppDbContext Create(string? dbName = null)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName ?? Guid.NewGuid().ToString())
            .Options;

        var publisherMock = new Mock<IPublisher>();
        
        var context = new AppDbContext(options, publisherMock.Object);
        context.Database.EnsureCreated();
        
        return context;
    }
}
