using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Constans;
using quiz_management_system.Application.Features.FilesFolder.Commads.UploadImage;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Responses.Files;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.Abstraction;

public sealed class UpdateAdminProfileCommandHandler(
    IAppDbContext db,
    IUserContext userContext,
    ISender sender,
    IFileService fileService)
    : IRequestHandler<UpdateAdminProfileCommand, Result>
{
    public async Task<Result> Handle(UpdateAdminProfileCommand cmd, CancellationToken ct)
    {
        Guid? userId = userContext.UserId;
        if (userId is null)
            return Result.Failure(UserError.Unauthorized());

        DomainUser? user = await db.Users
            .FirstOrDefaultAsync(u => u.Id == userId && u.Role == Role.Admin, ct);

        if (user is null)
            return Result.Failure(
                DomainError.NotFound(nameof(DomainUser), userId.Value));

        // 1️⃣ Update Full Name
        if (!string.IsNullOrWhiteSpace(cmd.FullName))
        {
            Result nameResult = user.UpdateFullName(cmd.FullName);
            if (nameResult.IsFailure)
                return nameResult;
        }

        // 2️⃣ Update Email Notifications
        if (cmd.EmailNotifications.HasValue)
        {
            Result notifResult =
                user.UpdateNotifications(cmd.EmailNotifications.Value);

            if (notifResult.IsFailure)
                return notifResult;
        }

        // 3️⃣ Update Profile Image
        if (cmd.ProfileImage is not null)
        {
            // delete old image if exists
            if (user.ProfileImageFileId.HasValue)
            {
                Result del =
                    await fileService.DeleteAsync(user.ProfileImageFileId.Value, ct);

                if (del.IsFailure)
                    return del;
            }

            var uploadCommand = new UploadImageCommand(
                EntityType: nameof(DomainUser),
                EntityId: user.Id,
                folder: DefaultFolders.Profiles,
                Image: cmd.ProfileImage
            );

            Result<UploadImageResponse> uploadResult =
                await sender.Send(uploadCommand, ct);

            if (uploadResult.IsFailure)
                return Result.Failure(uploadResult.TryGetError());

            Result assignResult =
                user.AssignProfileImage(uploadResult.TryGetValue().FileId);

            if (assignResult.IsFailure)
                return assignResult;
        }

        await db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
