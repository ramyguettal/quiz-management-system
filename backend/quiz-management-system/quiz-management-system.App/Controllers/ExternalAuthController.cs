using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Features.GoogleLogin;
using quiz_management_system.Contracts.Reponses.Identity;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Infrastructure.Idenitity;

namespace quiz_management_system.App.Controllers;

[ApiController]
[Route("api/identity")]
[Tags("Identity - External Auth")]
[Produces("application/json")]
[ApiVersion("1.0")]
public sealed class ExternalAuthController : ControllerBase
{
    private const string GoogleProvider = "Google";

    private readonly ISender sender;
    private readonly SignInManager<ApplicationUser> signInManager;

    public ExternalAuthController(
        ISender sender,
        SignInManager<ApplicationUser> signInManager)
    {
        this.sender = sender;
        this.signInManager = signInManager;
    }

   /// <summary>
    /// Initiates Google OAuth login flow.
    /// </summary>
    /// <response code="302">Redirect to Google OAuth login page.</response>
    [HttpGet("login/google")]
    [EndpointName("LoginWithGoogle")]
    [EndpointSummary("Redirects to Google OAuth login.")]
    [EndpointDescription("Starts Google OAuth sign-in flow.")]
    [ProducesResponseType(StatusCodes.Status302Found)]
    [AllowAnonymous]
    public IActionResult LoginWithGoogle()
    {
        string redirectUrl = Url.Action(
            action: nameof(GoogleCallback),
            controller: "ExternalAuth",
            values: null,
            protocol: Request.Scheme
        ) ?? string.Empty;

        AuthenticationProperties props =
            signInManager.ConfigureExternalAuthenticationProperties(
                provider: "Google",
                redirectUrl: redirectUrl
            );

        return Challenge(props, "Google");
    }

    /// <summary>
    /// Google OAuth callback endpoint.
    /// </summary>
    /// <remarks>
    /// Google returns the authenticated user details here.  
    /// The endpoint then calls MediatR to produce JWT + refresh tokens.
    /// </remarks>
    /// <response code="200">Successfully authenticated and tokens returned.</response>
    /// <response code="401">Authentication failed.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet("google/callback")]
    [EndpointName("GoogleCallback")]
    [EndpointSummary("Google authentication callback.")]
    [EndpointDescription("Receives Google OAuth response and generates user tokens.")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> GoogleCallback(CancellationToken ct)
    {
        Result<AuthResponse> result =
            await sender.Send(new GoogleLoginCommand(), ct);

        return result.ToActionResult<AuthResponse>(HttpContext);
    }
}
