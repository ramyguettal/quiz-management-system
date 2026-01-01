using Microsoft.AspNetCore.Http;

namespace quiz_management_system.Contracts.Reponses.Instructor;

public sealed class UpdateInstructorProfileRequest
{
    public string? FullName { get; set; }
    public string? Title { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Department { get; set; }
    public string? OfficeLocation { get; set; }
    public string? Bio { get; set; }
    public bool? EmailNotifications { get; set; }
    public IFormFile? ProfileImage { get; set; }
}