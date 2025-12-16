using Asp.Versioning;
using Mapster;
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
public sealed class ExternalAuthController(
    IAuthCookieWriter authCookieWriter,
    ISender sender,
    SignInManager<ApplicationUser> signInManager
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
    public IActionResult LoginWithGoogle([FromQuery] string deviceId)
    {
        if (string.IsNullOrWhiteSpace(deviceId))
            return BadRequest(new { error = "DeviceId is required." });

        string redirectUrl = Url.Action(
            action: nameof(GoogleCallback),
            controller: "ExternalAuth",
            values: new { deviceId },
            protocol: Request.Scheme
        ) ?? string.Empty;

        AuthenticationProperties props =
            signInManager.ConfigureExternalAuthenticationProperties(
                provider: GoogleProvider,
                redirectUrl: redirectUrl
            );

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
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> GoogleCallback(
        [FromQuery] string deviceId,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(deviceId))
            return BadRequest(new { error = "DeviceId is required." });

        Result<AuthDto> result =
            await sender.Send(new GoogleLoginCommand(deviceId), ct);

        if (result.IsFailure)
            return Result
                .Failure<AuthResponse>(result.TryGetError())
                .ToActionResult(HttpContext);

        AuthDto authDto = result.TryGetValue();

        authCookieWriter.Write(authDto);

        return Ok(authDto.Adapt<AuthResponse>());
    }
}
