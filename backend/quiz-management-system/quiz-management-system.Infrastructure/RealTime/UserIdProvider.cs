using Microsoft.AspNetCore.SignalR;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

public sealed class UserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        return connection.User?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
               ?? connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? connection.User?.FindFirst("sub")?.Value;
    }
}
