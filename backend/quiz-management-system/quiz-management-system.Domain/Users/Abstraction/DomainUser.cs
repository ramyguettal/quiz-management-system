using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Events;
using quiz_management_system.Domain.Files;
using quiz_management_system.Domain.Users.StudentsFolder.Enums;


namespace quiz_management_system.Domain.Users.Abstraction;




public abstract class DomainUser : AggregateRoot, IAuditable, ISoftDeletable
{


    public Guid? ProfileImageFileId { get; private set; }
    public UploadedFile? ProfileImage { get; private set; }


    public string FullName { get; protected set; } = string.Empty;
    public string Email { get; protected set; } = string.Empty;

    public UserStatus Status { get; private set; } = UserStatus.Active;
    public Role Role { get; private set; }


    public bool EmailNotifications { get; protected set; } = true;

    public ICollection<DomainNotification> Notifications { get; private set; } = new List<DomainNotification>();


    public DateTimeOffset CreatedAtUtc { get; protected set; } = DateTimeOffset.UtcNow;
    public Guid CreatedBy { get; protected set; } = Guid.Empty;
    public DateTimeOffset LastModifiedUtc { get; protected set; } = DateTimeOffset.UtcNow;
    public Guid LastModifiedBy { get; protected set; } = Guid.Empty;


    public bool IsDeleted { get; protected set; }
    public Guid? DeletedById { get; protected set; } = Guid.Empty;
    public DateTimeOffset? DeletedOn { get; protected set; }



    DateTimeOffset ICreatable.CreatedAtUtc
    {
        get => CreatedAtUtc;
        set => CreatedAtUtc = value;
    }

    Guid ICreatable.CreatedBy
    {
        get => CreatedBy;
        set => CreatedBy = value;
    }

    DateTimeOffset IUpdatable.LastModifiedUtc
    {
        get => LastModifiedUtc;
        set => LastModifiedUtc = value;
    }

    Guid IUpdatable.LastModifiedBy
    {
        get => LastModifiedBy;
        set => LastModifiedBy = value;
    }


    bool ISoftDeletable.IsDeleted
    {
        get => IsDeleted;
        set => IsDeleted = value;
    }

    Guid? ISoftDeletable.DeletedById
    {
        get => DeletedById;
        set => DeletedById = value;
    }

    DateTimeOffset? ISoftDeletable.DeletedOn
    {
        get => DeletedOn;
        set => DeletedOn = value;
    }


    protected DomainUser() { }

    protected DomainUser(Guid id, string fullName, string email, Role role) : base(id)
    {
        FullName = fullName;
        Email = email;
        Role = role;
    }


    public Result UpdateNotifications(bool emailNotifications)
    {
        EmailNotifications = emailNotifications;
        return Result.Success();
    }
    public void FireUserCreatedEvent(Guid id, string email, string fullName, string role)
    {
        this.AddDomainEvent(new ResetPasswordEvent(id, email, fullName, role));
    }
    public Result ActivateUser()
    {
        Status = UserStatus.Active;
        return Result.Success();
    }

    public Result DisActivateUser()
    {
        Status = UserStatus.InActive;
        return Result.Success();
    }



    public Result Restore()
    {
        if (!IsDeleted)
        {
            return Result.Failure(
                DomainError.InvalidState(nameof(DomainUser), "User is not deleted."));
        }

        IsDeleted = false;
        DeletedById = null;
        DeletedOn = null;
        Status = UserStatus.Active;




        return Result.Success();
    }

    public Result SoftDelete(Guid deletedBy)
    {
        if (IsDeleted)
        {
            return Result.Failure(
                DomainError.InvalidState(nameof(DomainUser), "User is already deleted."));
        }

        IsDeleted = true;
        DeletedById = deletedBy;
        DeletedOn = DateTimeOffset.UtcNow;
        Status = UserStatus.InActive;

        AddDomainEvent(
            new UserDeletedEvent(Id, DeletedById.Value, DeletedOn.Value));

        return Result.Success();
    }


    public Result UpdateFullName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
        {
            return Result.Failure(
                DomainError.InvalidState(
                    nameof(FullName),
                    "Full name cannot be empty."));
        }

        if (FullName == fullName)
        {
            return Result.Success(); // idempotent
        }

        FullName = fullName.Trim();
        LastModifiedUtc = DateTimeOffset.UtcNow;

        return Result.Success();
    }
    public Result AssignProfileImage(Guid? fileId)
    {
        if (fileId == Guid.Empty)
        {
            return Result.Failure(
                DomainError.InvalidState(
                    nameof(ProfileImageFileId),
                    "Invalid file id."));
        }

        ProfileImageFileId = fileId;
        LastModifiedUtc = DateTimeOffset.UtcNow;

        return Result.Success();
    }


}
