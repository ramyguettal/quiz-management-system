using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Requests.Users;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.UsersFeatures.Queries.GetUsers;

public sealed class GetUsersQueryHandler(
    IAppDbContext db
) : IRequestHandler<GetUsersQuery, Result<IReadOnlyList<UserListItemDto>>>
{
    public async Task<Result<IReadOnlyList<UserListItemDto>>> Handle(
        GetUsersQuery request,
        CancellationToken ct)
    {
        List<UserListItemDto> users =
            await db.Users
                .AsNoTracking()
                .IgnoreQueryFilters()
                .Select(u => new UserListItemDto(
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.Role,
                    u.Status
                ))
                .ToListAsync(ct);

        return Result.Success<IReadOnlyList<UserListItemDto>>(users);
    }
}