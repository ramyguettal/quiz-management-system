using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Constans;
using quiz_management_system.Application.Features.FilesFolder.Commads.UploadImage;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Responses.Files;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.StudentsFolder;

namespace quiz_management_system.Application.Features.Profiles.UpdateStudentProfile;

public sealed class UpdateStudentProfileCommandHandler(
    IAppDbContext db,
    IUserContext userContext,
    ISender sender,
    IFileService fileService)
    : IRequestHandler<UpdateStudentProfileCommand, Result>
{
    public async Task<Result> Handle(UpdateStudentProfileCommand cmd, CancellationToken ct)
    {
        Guid? userId = userContext.UserId;
        if (userId is null)
            return Result.Failure(UserError.Unauthorized());

        Student? student = await db.Students
            .FirstOrDefaultAsync(s => s.Id == userId, ct);

        if (student is null)
            return Result.Failure(
                DomainError.NotFound(nameof(Student), userId.Value));

        // 1️⃣ Update Full Name
        if (!string.IsNullOrWhiteSpace(cmd.FullName))
        {
            Result nameResult = student.UpdateFullName(cmd.FullName);
            if (nameResult.IsFailure)
                return nameResult;
        }

        // 2️⃣ Update Email Notifications
        if (cmd.EmailNotifications.HasValue)
        {
            Result notifResult =
                student.UpdateNotifications(cmd.EmailNotifications.Value);

            if (notifResult.IsFailure)
                return notifResult;
        }

        // 3️⃣ Update Profile Image
        if (cmd.ProfileImage is not null)
        {
            // delete old image if exists
            if (student.ProfileImageFileId.HasValue)
            {
                Result del =
                    await fileService.DeleteAsync(student.ProfileImageFileId.Value, ct);

                if (del.IsFailure)
                    return del;
            }

            var uploadCommand = new UploadImageCommand(
                EntityType: nameof(Student),
                EntityId: student.Id,
                folder: DefaultFolders.Profiles,
                Image: cmd.ProfileImage
            );

            Result<UploadImageResponse> uploadResult =
                await sender.Send(uploadCommand, ct);

            if (uploadResult.IsFailure)
                return Result.Failure(uploadResult.TryGetError());

            Result assignResult =
                student.AssignProfileImage(uploadResult.TryGetValue().FileId);

            if (assignResult.IsFailure)
                return assignResult;
        }

        await db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
