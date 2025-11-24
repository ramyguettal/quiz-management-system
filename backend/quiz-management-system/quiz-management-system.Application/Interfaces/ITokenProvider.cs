
using quiz_management_system.Application.Dtos;
using quiz_management_system.Contracts.Reponses;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using System.Security.Claims;

namespace quiz_management_system.Application.Interfaces;

public interface ITokenProvider : IScopedService
{
    Task<Result<AuthResponse>> GenerateJwtTokenAsync(AuthenticatedUser user, CancellationToken ct = default);

    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}


