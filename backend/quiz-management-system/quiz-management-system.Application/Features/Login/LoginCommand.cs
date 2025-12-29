using MediatR;
using quiz_management_system.Contracts.Reponses.Identity;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Login;


public sealed record LoginCommand(
    string Email,
    string Password,
    string DeviceId
) : IRequest<Result<AuthDto>>;
