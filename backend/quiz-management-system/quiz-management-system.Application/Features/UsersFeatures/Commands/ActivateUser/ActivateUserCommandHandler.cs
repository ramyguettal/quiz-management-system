using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.UsersFeatures.Commands.ActivateUser;

public sealed class ActivateUserCommandHandler(
    IAppDbContext db,
    IIdentityService identityService)
    : IRequestHandler<ActivateUserCommand, Result>
{
    public async Task<Result> Handle(
        ActivateUserCommand request,
        CancellationToken ct)
    {
        Domain.Users.Abstraction.DomainUser? domainUser =
            await db.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Id == request.UserId, ct);

        if (domainUser is null)
            return Result.Failure(
                UserError.NotFound("Domain user not found."));

        Result domainResult = domainUser.Restore();
        if (domainResult.IsFailure)
            return domainResult;

        Result identityResult =
            await identityService.ActivateAsync(
                request.UserId,
                ct);

        if (identityResult.IsFailure)
            return identityResult;

        await db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
