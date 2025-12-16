using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.UsersFeatures.Commands.ActivateUser;

public sealed record ActivateUserCommand(Guid UserId) : IRequest<Result>;
