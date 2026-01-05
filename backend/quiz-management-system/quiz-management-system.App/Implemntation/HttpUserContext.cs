using quiz_management_system.Application.Interfaces;
using System.Security.Claims;

namespace quiz_management_system.App.Implemntation;

public class HttpUserContext(IHttpContextAccessor accessor) : IUserContext
{


    public Guid? UserId
    {
        get
        {
            string? raw = accessor.HttpContext?
                .User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (raw is null)
                return null;

            if (!Guid.TryParse(raw, out Guid id))
                return null;

            return id;
        }
    }


    public string? UserRole
    {
        get
        {
            string? role = accessor.HttpContext?
                .User?
                .FindFirstValue(ClaimTypes.Role);

            return string.IsNullOrWhiteSpace(role) ? null : role;
        }
    }
}


