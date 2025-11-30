namespace quiz_management_system.Domain.Common.ResultPattern.Result;

using quiz_management_system.Domain.Common.ResultPattern.Error;

public sealed record FailureResult(Error Error) : Result(false);
public sealed record FailureResult<T>(Error Error)
    : Result<T>(false);