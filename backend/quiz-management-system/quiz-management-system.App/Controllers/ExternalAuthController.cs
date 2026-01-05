using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Features.GoogleLogin;
using quiz_management_system.Application.Features.UsersFeatures.Queries.GetMe;
using quiz_management_system.Contracts.Reponses.Identity;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Infrastructure.Idenitity;

namespace quiz_management_system.App.Controllers;

[ApiController]
[Route("api/identity")]
[Tags("Identity - External Auth")]
[Produces("application/json")]
[ApiVersion("1.0")]
public sealed class ExternalAuthController(
    IAuthCookieWriter authCookieWriter,
    ISender sender,
    SignInManager<ApplicationUser> signInManager, FrontendOptions frontendOptions
) : ControllerBase
{
    private const string GoogleProvider = "Google";

    /// <summary>
    /// Initiates Google OAuth login flow.
    /// </summary>
    /// <remarks>
    /// Requires a <b>deviceId</b> which is forwarded through the Google OAuth process
    /// and returned to the callback route for token generation.
    /// </remarks>
    [HttpGet("login/google")]
    [EndpointName("LoginWithGoogle")]
    [EndpointSummary("Redirects to Google OAuth login.")]
    [EndpointDescription("Starts Google OAuth sign-in flow and preserves the deviceId.")]
    [ProducesResponseType(StatusCodes.Status302Found)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [AllowAnonymous]

    public IActionResult LoginWithGoogle(
    [FromQuery] string deviceId,
    [FromQuery] string redirectUrl)
    {
        if (string.IsNullOrWhiteSpace(deviceId))
            return BadRequest(new { error = "DeviceId is required." });

        if (string.IsNullOrWhiteSpace(redirectUrl))
            return BadRequest(new { error = "RedirectUrl is required." });

        string callbackUrl = Url.Action(
            nameof(GoogleCallback),
            "ExternalAuth",
            values: new { deviceId, redirectUrl },
            protocol: Request.Scheme
        )!;

        AuthenticationProperties props =
            signInManager.ConfigureExternalAuthenticationProperties(
                GoogleProvider,
                callbackUrl);

        return Challenge(props, GoogleProvider);
    }

    /// <summary>
    /// Google OAuth callback endpoint.
    /// </summary>
    /// <remarks>
    /// Receives Google OAuth response, generates JWT + refresh token (scoped by deviceId),
    /// and writes auth cookies.
    /// </remarks>
    [HttpGet("google/callback")]
    [EndpointName("GoogleCallback")]
    [EndpointSummary("Google authentication callback.")]
    [EndpointDescription("Receives Google OAuth response and generates user tokens.")]
    [ProducesResponseType(StatusCodes.Status302Found)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [AllowAnonymous]
    public async Task<IActionResult> GoogleCallback(
    [FromQuery] string deviceId,
    [FromQuery] string redirectUrl,
    CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(deviceId))
            return BadRequest("missing_device_id");

        Result<AuthDto> result =
            await sender.Send(new GoogleLoginCommand(deviceId), ct);

        if (result.IsFailure)
            return Redirect($"{redirectUrl}?error=google_login_failed");

        authCookieWriter.Write(result.TryGetValue());

        return Redirect(redirectUrl);
    }


    private string BuildErrorRedirect(string error)
    {
        string callbackUrl = frontendOptions.AuthCallbackUrl;
        return $"{callbackUrl}?error={Uri.EscapeDataString(error)}";
    }



    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<AuthResponse>> Me(CancellationToken ct)
    {
        Result<AuthResponse> result =
            await sender.Send(new GetMeQuery(), ct);

        return result.ToActionResult(HttpContext);
    }
}
