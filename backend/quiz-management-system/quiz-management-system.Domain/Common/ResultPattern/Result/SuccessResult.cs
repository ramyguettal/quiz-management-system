
namespace quiz_management_system.Domain.Common.ResultPattern.Result;

public sealed record SuccessResult()
    : Result(true);
public sealed record SuccessResult<T>(T Value)
    : Result<T>(true);