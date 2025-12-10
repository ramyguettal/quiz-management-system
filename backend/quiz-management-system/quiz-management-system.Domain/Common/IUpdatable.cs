namespace quiz_management_system.Domain.Common;

public interface IUpdatable
{
    DateTimeOffset LastModifiedUtc { get; set; }
    Guid LastModifiedBy { get; set; }
}
