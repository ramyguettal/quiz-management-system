using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.RecentActivities.Commands.DeleteRecentActivities;

public sealed class DeleteRecentActivitiesCommandHandler(IAppDbContext db)
    : IRequestHandler<DeleteRecentActivitiesCommand, Result<int>>
{
    public async Task<Result<int>> Handle(
        DeleteRecentActivitiesCommand request,
        CancellationToken ct)
    {
        if (request.Ids == null || request.Ids.Count == 0)
        {
            return Result.Success(0);
        }

        // Bulk delete using ExecuteDeleteAsync for efficiency
        int deletedCount = await db.RecentActivities
            .Where(a => request.Ids.Contains(a.Id))
            .ExecuteDeleteAsync(ct);

        return Result.Success(deletedCount);
    }
}
