using System.ComponentModel.DataAnnotations;

namespace quiz_management_system.Application.Common.Settings;

public class JwtSettings
{
    public const string SectionName = "JwtSettings";

    [Required]
    public string Issuer { get; set; } = string.Empty;

    [Required]
    public string Audience { get; set; } = string.Empty;

    [Required]
    [MinLength(32, ErrorMessage = "SecretKey must be at least 32 characters long for security.")]
    public string SecretKey { get; set; } = string.Empty;

    [Range(1, 1440, ErrorMessage = "Access token expiration must be between 1 and 1440 minutes.")]
    public int AccessTokenExpirationMinutes { get; set; }

}
