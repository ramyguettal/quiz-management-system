using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.RecentActivities.Commands.DeleteRecentActivities;

/// <summary>
/// Command to delete multiple recent activities by their IDs.
/// </summary>
public sealed record DeleteRecentActivitiesCommand(List<Guid> Ids) : IRequest<Result<int>>;
