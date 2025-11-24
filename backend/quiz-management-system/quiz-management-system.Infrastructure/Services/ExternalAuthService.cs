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
    public async Task<Result<ExternalAuthDto>> SignInWithGoogleAsync(CancellationToken ct)
    {
        try
        {
            var info = await signInManager.GetExternalLoginInfoAsync();
            if (info is null)
                return Result.Failure<ExternalAuthDto>(
                    ExternalAuthError.InvalidProviderResponse("Google did not return external login info."));

            string? email = info.Principal.FindFirstValue(ClaimTypes.Email);

            string? fullName = info.Principal.FindFirstValue(ClaimTypes.Name);


            if (email is null)
                return Result.Failure<ExternalAuthDto>(
                    ExternalAuthError.InvalidProviderResponse("Google did not return an email."));

            ApplicationUser? identityUser = await userManager.FindByEmailAsync(email);

            if (identityUser is null)
            {
                return Result.Failure<ExternalAuthDto>(
                    ExternalAuthError.UserNotRegistered("This Google account is not registered."));
            }

            var loginRecord = await userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);

            if (loginRecord is null)
            {
                var linkResult = await userManager.AddLoginAsync(identityUser, info);
                if (!linkResult.Succeeded)
                    return Result.Failure<ExternalAuthDto>(
                        ExternalAuthError.LoginLinkFailed("Login With Google Failed"));
            }








            var response = new ExternalAuthDto(


            );

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            return Result.Failure<ExternalAuthDto>(
                ExternalAuthError.Unknown($"Unexpected error: {ex.Message}"));
        }
    }

}