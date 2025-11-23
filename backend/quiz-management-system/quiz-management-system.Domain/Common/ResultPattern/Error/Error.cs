namespace quiz_management_system.Domain.Common.ResultPattern.Error;



public abstract record Error(ErrorCode Code, string Type, string Description)
{
    public override string ToString() => $"{Type} ({Code}): {Description}";
}