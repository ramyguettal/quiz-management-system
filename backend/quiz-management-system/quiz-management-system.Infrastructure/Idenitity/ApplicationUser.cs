using Microsoft.AspNetCore.Identity;
using quiz_management_system.Domain.Common.Identity;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Infrastructure.Idenitity;
using System.Net.Mail;
public sealed class ApplicationUser : IdentityUser
{
    public List<RefreshToken> RefreshTokens { get; private set; } = new();

    private ApplicationUser() { } // EF Core

    public static Result<ApplicationUser> Create(string email, string fullName)
    {
        // Email null or empty
        if (string.IsNullOrWhiteSpace(email))
        {
            return Result.Failure<ApplicationUser>(
                IdentityUserError.Validation("Email cannot be empty.")
            );
        }

        // Full name null or empty
        if (string.IsNullOrWhiteSpace(fullName))
        {
            return Result.Failure<ApplicationUser>(
                IdentityUserError.Validation("Full name cannot be empty.")
            );
        }

        // Email format validation
        try
        {
            _ = new MailAddress(email);
        }
        catch
        {
            return Result.Failure<ApplicationUser>(
                IdentityUserError.Validation("Email format is invalid.")
            );
        }

        var user = new ApplicationUser
        {
            Id = Guid.CreateVersion7().ToString(),


            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),

            UserName = fullName,
            NormalizedUserName = fullName.ToUpperInvariant(),

            EmailConfirmed = true
        };

        return Result.Success(user);
    }
}
