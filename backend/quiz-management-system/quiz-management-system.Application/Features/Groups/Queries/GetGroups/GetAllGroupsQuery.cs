using MediatR;
using quiz_management_system.Contracts.Reponses.Groups;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Groups.Queries.GetGroups;

public sealed record GetAllGroupsQuery(
    Guid? YearId = null
) : IRequest<Result<IReadOnlyList<GroupWithAcademicYearResponse>>>;
