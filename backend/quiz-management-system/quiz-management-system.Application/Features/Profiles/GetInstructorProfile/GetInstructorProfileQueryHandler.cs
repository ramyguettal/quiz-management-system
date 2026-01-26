using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Requests.Instructor;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.InstructorsFolders;

namespace quiz_management_system.Application.Features.Profiles.GetInstructorProfile;

public sealed class GetInstructorProfileQueryHandler(
    IAppDbContext db,
    IUserContext userContext,
    [FromKeyedServices("files")] IUrlBuilder fileUrlBuilder)
    : IRequestHandler<GetInstructorProfileQuery, Result<InstructorProfileResponse>>
{
    public async Task<Result<InstructorProfileResponse>> Handle(
        GetInstructorProfileQuery query,
        CancellationToken ct)
    {
        Guid? userId = userContext.UserId;
        if (userId is null)
            return Result.Failure<InstructorProfileResponse>(UserError.Unauthorized());

        InstructorProfileResponse? profile = await db.Instructors
            .Where(i => i.Id == userId)
            .Select(i => new InstructorProfileResponse(
                i.Id,
                i.FullName,
                i.Email,
                i.Title,
                i.PhoneNumber,
                i.Department,
                i.OfficeLocation,
                i.Bio,
                i.ProfileImageFileId.HasValue
                    ? fileUrlBuilder.GetUrl(i.ProfileImageFileId.Value)
                    : null,
                i.EmailNotifications,
                i.CreatedAtUtc
            ))
           .FirstOrDefaultAsync(ct);

        if (profile is null)
            return Result.Failure<InstructorProfileResponse>(
                DomainError.NotFound(nameof(Instructor), userId.Value));

        return Result.Success(profile);
    }
}
