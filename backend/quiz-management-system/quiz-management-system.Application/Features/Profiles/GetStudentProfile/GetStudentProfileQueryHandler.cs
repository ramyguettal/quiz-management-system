using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Requests.Student;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.StudentsFolder;

namespace quiz_management_system.Application.Features.Profiles.GetStudentProfile;

public sealed class GetStudentProfileQueryHandler(
    IAppDbContext db,
    IUserContext userContext,
    [FromKeyedServices("files")] IUrlBuilder fileUrlBuilder)
    : IRequestHandler<GetStudentProfileQuery, Result<StudentProfileResponse>>
{
    public async Task<Result<StudentProfileResponse>> Handle(
        GetStudentProfileQuery query,
        CancellationToken ct)
    {
        Guid? userId = userContext.UserId;
        if (userId is null)
            return Result.Failure<StudentProfileResponse>(UserError.Unauthorized());

        StudentProfileResponse? profile = await db.Students
            .Where(s => s.Id == userId)
            .Select(s => new StudentProfileResponse(
                s.Id,
                s.FullName,
                s.Email,
                s.AcademicYearId,
                s.AcademicYear.Number,
                s.Status.ToString(),
                s.ProfileImageFileId.HasValue
                    ? fileUrlBuilder.GetUrl(s.ProfileImageFileId.Value)
                    : null,
                s.EmailNotifications,
                s.CreatedAtUtc
            ))
            .FirstOrDefaultAsync(ct);

        if (profile is null)
            return Result.Failure<StudentProfileResponse>(
                DomainError.NotFound(nameof(Student), userId.Value));

        return Result.Success(profile);
    }
}