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

        // Get student data
        var studentData = await db.Students
            .Where(s => s.Id == userId)
            .Select(s => new
            {
                s.Id,
                s.FullName,
                s.Email,
                s.AcademicYearId,
                AcademicYearNumber = s.AcademicYear.Number,
                Status = s.Status.ToString(),
                s.ProfileImageFileId,
                s.EmailNotifications,
                s.CreatedAtUtc
            })
            .FirstOrDefaultAsync(ct);

        if (studentData is null)
            return Result.Failure<StudentProfileResponse>(
                DomainError.NotFound(nameof(Student), userId.Value));

        // Get student's group (student has only one group)
        var groupInfo = await db.GroupStudents
            .Where(gs => gs.StudentId == userId)
            .Select(gs => new StudentGroupInfo(
                gs.GroupId,
                gs.Group.GroupNumber
            ))
            .FirstOrDefaultAsync(ct);

        var profile = new StudentProfileResponse(
            studentData.Id,
            studentData.FullName,
            studentData.Email,
            studentData.AcademicYearId,
            studentData.AcademicYearNumber,
            studentData.Status,
            studentData.ProfileImageFileId.HasValue
                ? fileUrlBuilder.GetUrl(studentData.ProfileImageFileId.Value)
                : null,
            studentData.EmailNotifications,
            studentData.CreatedAtUtc,
            groupInfo
        );

        return Result.Success(profile);
    }
}