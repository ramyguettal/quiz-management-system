using Microsoft.AspNetCore.Http;

namespace quiz_management_system.Contracts.Reponses.Admin;

public sealed record UpdateAdminProfileRequest
{
    public string? FullName { get; set; }
    public bool? EmailNotifications { get; set; }
    public IFormFile? ProfileImage { get; set; }
}
