namespace quiz_management_system.Domain.Common;

public interface ICreatable
{
    DateTimeOffset CreatedAtUtc { get; set; }
    Guid CreatedBy { get; set; }
}
