namespace quiz_management_system.Contracts.Requests.RecentActivity;

/// <summary>
/// Request to delete multiple recent activities by their IDs.
/// </summary>
public sealed record DeleteRecentActivitiesRequest(List<Guid> Ids);
