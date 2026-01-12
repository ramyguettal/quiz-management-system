using MediatR;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Reponses.RecentActivity;
using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.RecentActivities.Queries.GetRecentActivities;

/// <summary>
/// Query to get cursor-paginated recent activities.
/// </summary>
public sealed record GetRecentActivitiesQuery(
    string? Cursor = null,
    int PageSize = 20,
    ActivityType? ActivityType = null
) : IRequest<Result<CursorPagedResponse<RecentActivityResponse>>>;
