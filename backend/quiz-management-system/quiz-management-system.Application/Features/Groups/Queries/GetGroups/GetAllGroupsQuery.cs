using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Groups;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Groups.Queries.GetGroups;

public sealed record GetAllGroupsQuery()
    : ICachedQuery<Result<IReadOnlyList<GroupWithAcademicYearResponse>>>
{
    public static string GetCacheKey() => "groups:all";

    public string CacheKey => GetCacheKey();

    public string[] Tags => new[] { "groups" };

    public TimeSpan Expiration => TimeSpan.FromHours(24);
}
