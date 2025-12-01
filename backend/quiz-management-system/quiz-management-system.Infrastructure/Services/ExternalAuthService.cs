using Microsoft.AspNetCore.Identity;
using quiz_management_system.Application.Dtos;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Infrastructure.Common.Errors;
using System.Security.Claims;

namespace quiz_management_system.Infrastructure.Services;

public sealed class ExternalAuthService(SignInManager<ApplicationUser> signInManager
    , UserManager<ApplicationUser> userManager
) : IExternalAuthService
{
    public async Task<Result<AuthenticatedUser>> SignInWithGoogleAsync(CancellationToken ct)
    {
        try
        {
            var info = await signInManager.GetExternalLoginInfoAsync();
            if (info is null)
                return Result.Failure<AuthenticatedUser>(
                    ExternalAuthError.InvalidProviderResponse("Google did not return external login info."));

            string? email = info.Principal.FindFirstValue(ClaimTypes.Email);

            string? fullName = info.Principal.FindFirstValue(ClaimTypes.Name);


            if (email is null)
                return Result.Failure<AuthenticatedUser>(
                    ExternalAuthError.InvalidProviderResponse("Google did not return an email."));

            ApplicationUser? identityUser = await userManager.FindByEmailAsync(email);

            if (identityUser is null)
            {
                return Result.Failure<AuthenticatedUser>(
                    ExternalAuthError.UserNotRegistered("This Google account is not registered."));
            }

            var loginRecord = await userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);

            if (loginRecord is null)
            {
                var linkResult = await userManager.AddLoginAsync(identityUser, info);
                if (!linkResult.Succeeded)
                    return Result.Failure<AuthenticatedUser>(
                        ExternalAuthError.LoginLinkFailed("Login With Google Failed"));
            }







            string? role = (await userManager.GetRolesAsync(identityUser)).FirstOrDefault();
            var response = new AuthenticatedUser(identityUser.Id, identityUser.Email, identityUser.UserName, role



            );

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            return Result.Failure<AuthenticatedUser>(
                ExternalAuthError.Unknown($"Unexpected error: {ex.Message}"));
        }
    }

}