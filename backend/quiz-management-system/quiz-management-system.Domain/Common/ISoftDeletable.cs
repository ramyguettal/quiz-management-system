using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Domain.Common;

public interface ISoftDeletable
{
    bool IsDeleted { get; set; }
    Guid? DeletedById { get; set; }
    DateTimeOffset? DeletedOn { get; set; }

    public Result SoftDelete(Guid deletedBy);

}