using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Admin;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.Abstraction;

namespace quiz_management_system.Application.Features.Profiles.GetAdminProfile;

public sealed class GetAdminProfileQueryHandler(
    IAppDbContext db,
    IUserContext userContext,
    [FromKeyedServices("files")] IUrlBuilder fileUrlBuilder)
    : IRequestHandler<GetAdminProfileQuery, Result<AdminProfileResponse>>
{
    public async Task<Result<AdminProfileResponse>> Handle(
        GetAdminProfileQuery query,
        CancellationToken ct)
    {
        Guid? userId = userContext.UserId;
        if (userId is null)
            return Result.Failure<AdminProfileResponse>(UserError.Unauthorized());

        AdminProfileResponse? profile = await db.Users
            .OfType<DomainUser>()
            .Where(u => u.Id == userId && u.Role == Role.Admin)
            .Select(u => new AdminProfileResponse(
                u.Id,
                u.FullName,
                u.Email,
                u.ProfileImageFileId.HasValue
                    ? fileUrlBuilder.GetUrl(u.ProfileImageFileId.Value)
                    : null,
                u.EmailNotifications,
                u.CreatedAtUtc
            ))
            .FirstOrDefaultAsync(ct);

        if (profile is null)
            return Result.Failure<AdminProfileResponse>(
                DomainError.NotFound(nameof(DomainUser), userId.Value));

        return Result.Success(profile);
    }
}
