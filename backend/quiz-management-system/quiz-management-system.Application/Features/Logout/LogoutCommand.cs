using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Logout;

public sealed record LogoutCommand(
    Guid UserId,
    string DeviceId,
    string? RefreshToken
) : IRequest<Result>;
