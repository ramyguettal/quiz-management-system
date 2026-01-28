using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Reponses.Groups;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Groups.Queries.GetGroups;

public sealed class GetAllGroupsHandler(IAppDbContext _context)
    : IRequestHandler<GetAllGroupsQuery, Result<IReadOnlyList<GroupWithAcademicYearResponse>>>
{


    public async Task<Result<IReadOnlyList<GroupWithAcademicYearResponse>>> Handle(
        GetAllGroupsQuery request,
        CancellationToken ct)
    {
        var query = _context.Groups
            .AsNoTracking()
            .Include(g => g.AcademicYear)
            .AsQueryable();

        if (request.YearId.HasValue)
            query = query.Where(g => g.AcademicYearId == request.YearId.Value);

        var groups = await query
            .Select(g => new GroupWithAcademicYearResponse(
                g.Id,
                g.GroupNumber,
                g.AcademicYearId,
                g.AcademicYear.Number
            ))
            .ToListAsync(ct);

        return Result.Success<IReadOnlyList<GroupWithAcademicYearResponse>>(groups);
    }
}