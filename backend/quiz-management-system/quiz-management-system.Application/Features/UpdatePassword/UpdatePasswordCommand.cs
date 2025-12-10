using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.UpdatePassword;

public record UpdatePasswordCommand(string CurrentPassword, string NewPassword, string UserIpAddress) : IRequest<Result>;
