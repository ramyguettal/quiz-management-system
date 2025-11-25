using quiz_management_system.Application.Dtos;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Interfaces;

public interface IExternalAuthService : IScopedService
{
    Task<Result<AuthenticatedUser>> SignInWithGoogleAsync(CancellationToken ct);
}