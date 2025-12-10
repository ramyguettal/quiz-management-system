using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Refresh;

public sealed record RefreshTokenCommand(string RefreshToken)
    : IRequest<Result>;
