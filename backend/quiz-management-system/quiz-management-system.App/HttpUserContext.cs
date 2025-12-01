using quiz_management_system.Application.Interfaces;
using System.Security.Claims;

namespace quiz_management_system.App
{
    public class HttpUserContext(IHttpContextAccessor _accessor) : IUserContext
    {


        public string? UserId =>
            _accessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}