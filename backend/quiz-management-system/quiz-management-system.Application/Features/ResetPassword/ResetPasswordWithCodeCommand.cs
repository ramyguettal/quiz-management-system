using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.ResetPassword
{
    public sealed record ResetPasswordWithCodeCommand(
        Guid UserId,
        string Code,
        string NewPassword,
        string UserIpAddress
    ) : IRequest<Result>;
}