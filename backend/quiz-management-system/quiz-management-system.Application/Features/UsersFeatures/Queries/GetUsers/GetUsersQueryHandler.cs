using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Requests.Users;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.Abstraction;

namespace quiz_management_system.Application.Features.UsersFeatures.Queries.GetUsers;

public sealed class GetUsersQueryHandler(
    IAppDbContext db
) : IRequestHandler<GetUsersQuery, Result<IReadOnlyList<UserListItemDto>>>
{
    public async Task<Result<IReadOnlyList<UserListItemDto>>> Handle(
        GetUsersQuery request,
        CancellationToken ct)
    {
        IQueryable<DomainUser> query =
            db.Users
              .AsNoTracking()
              .IgnoreQueryFilters();

        if (request.Role is not null)
        {
            query = query.Where(u => u.Role == request.Role.Value);
        }

        List<UserListItemDto> users =
            await query
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
