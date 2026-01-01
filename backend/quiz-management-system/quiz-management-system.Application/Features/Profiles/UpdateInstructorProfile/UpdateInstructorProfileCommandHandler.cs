using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Constans;
using quiz_management_system.Application.Features.FilesFolder.Commads.UploadImage;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Responses.Files;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.InstructorsFolders;

namespace quiz_management_system.Application.Features.Profiles.UpdateInstructorProfile;

public sealed class UpdateInstructorProfileCommandHandler(
    IAppDbContext db,
    IUserContext userContext,
    ISender sender,
    IFileService fileService)
    : IRequestHandler<UpdateInstructorProfileCommand, Result>
{
    public async Task<Result> Handle(UpdateInstructorProfileCommand cmd, CancellationToken ct)
    {
        Guid? userId = userContext.UserId;
        if (userId is null)
            return Result.Failure(UserError.Unauthorized());

        Instructor? instructor = await db.Instructors
            .FirstOrDefaultAsync(i => i.Id == userId, ct);

        if (instructor is null)
            return Result.Failure(
                DomainError.NotFound(nameof(Instructor), userId.Value));

        // 1️⃣ Instructor-specific profile fields (already correct)
        if (!string.IsNullOrWhiteSpace(cmd.FullName))
        {
            Result nameResult = instructor.ChangeFullName(cmd.FullName);
            if (nameResult.IsFailure)
                return nameResult;
        }

        if (!string.IsNullOrWhiteSpace(cmd.Title))
        {
            instructor.ChangeTitle(cmd.Title);
        }

        if (!string.IsNullOrWhiteSpace(cmd.PhoneNumber))
        {
            instructor.ChangePhoneNumber(cmd.PhoneNumber);
        }

        if (!string.IsNullOrWhiteSpace(cmd.Department))
        {
            Result deptResult = instructor.ChangeDepartment(cmd.Department);
            if (deptResult.IsFailure)
                return deptResult;
        }

        if (!string.IsNullOrWhiteSpace(cmd.OfficeLocation))
        {
            instructor.ChangeOfficeLocation(cmd.OfficeLocation);
        }

        if (cmd.Bio is not null)
        {
            instructor.ChangeBio(cmd.Bio);
        }

        // 2️⃣ Shared DomainUser behavior
        if (cmd.EmailNotifications.HasValue)
        {
            Result notifResult =
                instructor.UpdateNotifications(cmd.EmailNotifications.Value);

            if (notifResult.IsFailure)
                return notifResult;
        }

        // 3️⃣ Profile image (use DomainUser method)
        if (cmd.ProfileImage is not null)
        {
            if (instructor.ProfileImageFileId.HasValue)
            {
                Result del =
                    await fileService.DeleteAsync(instructor.ProfileImageFileId.Value, ct);

                if (del.IsFailure)
                    return del;
            }

            var uploadCommand = new UploadImageCommand(
                EntityType: nameof(Instructor),
                EntityId: instructor.Id,
                folder: DefaultFolders.Profiles,
                Image: cmd.ProfileImage
            );

            Result<UploadImageResponse> uploadResult =
                await sender.Send(uploadCommand, ct);

            if (uploadResult.IsFailure)
                return Result.Failure(uploadResult.TryGetError());

            Result assignResult =
                instructor.AssignProfileImage(uploadResult.TryGetValue().FileId);

            if (assignResult.IsFailure)
                return assignResult;
        }

        await db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
