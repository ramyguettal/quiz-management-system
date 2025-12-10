using quiz_management_system.Application.Interfaces;
using System.Security.Claims;

namespace quiz_management_system.App;

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
}