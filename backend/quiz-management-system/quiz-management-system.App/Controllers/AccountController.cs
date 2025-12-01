using Makayen.App.Helpers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.Application.Features.GoogleLogin;
using quiz_management_system.Contracts.Reponses.Identity;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace Makayen.App.Controllers;


/// <summary>
/// Handles Google OAuth authentication.
/// </summary>
/// <remarks>
/// This controller provides the public endpoints required for:
/// - Starting Google OAuth login flow
/// - Handling Google callback
/// </remarks>
[ApiController]
[Route("api/identity")]
[Tags("Identity - External Auth")]
[Produces("application/json")]
[Authorize(AuthenticationSchemes = "Identity.Application")]
public sealed class ExternalAuthController(ISender sender, SignInManager<ApplicationUser> signInManager)
    : ControllerBase
{
    /// <summary>
    /// Initiates Google OAuth authentication flow.
    /// </summary>
    /// <remarks>
    /// Redirects the user to Google's login page using the configured OAuth client.
    /// Google will later redirect back to <b>/api/identity/google/callback</b>.
    /// </remarks>
    /// <response code="302">Redirect to Google OAuth login page.</response>
    [HttpGet("login/google")]
    [EndpointName("LoginWithGoogle")]
    [EndpointSummary("Redirects to Google OAuth login.")]
    [EndpointDescription("Starts Google sign-in flow by redirecting to the Google authentication page.")]
    [AllowAnonymous]
public IActionResult LoginWithGoogle()
{
  var callbackUrl = Url.Action(
            action: nameof(GoogleCallback),
            controller: "ExternalAuth",
            values: null,
            protocol: "https"   
        );

        var props = signInManager.ConfigureExternalAuthenticationProperties(
            provider: "Google",
            redirectUrl: callbackUrl
        );

        return Challenge(props, "Google");
}

    /// <summary>
    /// Handles Google OAuth callback.
    /// </summary>
    /// <remarks>
    /// After the user authenticates in Google, they are redirected here.
    /// This endpoint delegates processing to the application layer via MediatR.
    /// </remarks>
    /// <response code="200">Successfully authenticated with Google.</response>
    /// <response code="400">Google did not return valid login information.</response>
    /// <response code="500">Unexpected internal server error.</response>
    [HttpGet("google/callback")]
    [EndpointName("GoogleCallback")]
    [EndpointSummary("Google authentication callback.")]
    [EndpointDescription("Receives Google OAuth login response and returns user information plus tokens.")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> GoogleCallback(CancellationToken ct)
    {
        Result<AuthResponse> result = await sender.Send(new GoogleLoginCommand(), ct);
        return result.ToActionResult<AuthResponse>(HttpContext);
    }
}





