using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.UsersFeatures.Commands.DeactivateUser;

public sealed class DeactivateUserCommandHandler(
    IAppDbContext db,
    IIdentityService identityService,
    IUserContext userContext)
    : IRequestHandler<DeactivateUserCommand, Result>
{
    public async Task<Result> Handle(
        DeactivateUserCommand request,
        CancellationToken ct)
    {
        Guid deletedBy = userContext.UserId ?? Guid.Empty;

        Domain.Users.Abstraction.DomainUser? domainUser =
            await db.Users
                .FirstOrDefaultAsync(u => u.Id == request.UserId, ct);

        if (domainUser is null)
            return Result.Failure(
                UserError.Unauthorized());

        Result domainResult = domainUser.SoftDelete(deletedBy);
        if (domainResult.IsFailure)
            return domainResult;

        Result identityResult =
            await identityService.DeactivateAsync(
                request.UserId,
                deletedBy,
                ct);

        if (identityResult.IsFailure)
            return identityResult;

        await db.SaveChangesAsync(ct);

        return Result.Success();
    }
}