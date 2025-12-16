
using quiz_management_system.Application.Dtos;
using quiz_management_system.Contracts.Reponses.Identity;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using System.Security.Claims;

namespace quiz_management_system.Application.Interfaces;

public interface ITokenProvider : IScopedService
{
    Task<Result<AuthDto>> GenerateJwtTokenAsync(
            AuthenticatedUser user,
            string deviceId,
            CancellationToken ct = default);

    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}


