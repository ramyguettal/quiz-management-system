using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Identity;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.UsersFeatures.Queries.GetMe;

public sealed record GetMeQuery() : IRequest<Result<AuthResponse>>;

public sealed class GetMeQueryHandler(
    IAppDbContext dbContext,
    IUserContext userContext
) : IRequestHandler<GetMeQuery, Result<AuthResponse>>
{
    public async Task<Result<AuthResponse>> Handle(
        GetMeQuery request,
        CancellationToken ct)
    {
        Guid? userId = userContext.UserId;

        if (userId is null)
            return Result.Failure<AuthResponse>(UserError.NotFound());

        AuthResponse? authResponse =
            await dbContext.Users
                .AsNoTracking()
                .Where(u => u.Id == userId && !u.IsDeleted)
                .Select(u => new AuthResponse(
                    u.Id.ToString(),
                    u.Email,
                    u.FullName,
                    u.Role.ToString()
                ))
                .SingleOrDefaultAsync(ct);

        if (authResponse is null)
            return Result.Failure<AuthResponse>(UserError.NotFound());

        return Result.Success(authResponse);
    }
}
