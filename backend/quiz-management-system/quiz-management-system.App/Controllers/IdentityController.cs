using Asp.Versioning;
using Makayen.App.Helpers;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.Application.Features.ForgotPassword;
using quiz_management_system.Application.Features.Login;
using quiz_management_system.Application.Features.Refresh;
using quiz_management_system.Application.Features.ResetPassword;
using quiz_management_system.Contracts.Reponses.Identity;
using quiz_management_system.Contracts.Requests.Identity;
using quiz_management_system.Domain.Common.ResultPattern.Result;
namespace quiz_management_system.App.Controllers;









/// <summary>
/// Handles all identity-related actions such as login, token refresh,
/// email confirmation, password reset, and verification flows.
/// </summary>
[ApiController]
[Route("api/identity")]
[Tags("Identity")]
[Produces("application/json")]
[Consumes("application/json")]
[ApiVersion("1.0")]

public sealed class IdentityController(ISender sender) : ControllerBase
{

    /// <summary>
    /// Authenticates a user using email + password credentials.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Authenticates a user by email.")]
    [EndpointDescription("Validates email and password and returns a JWT + Refresh token pair as http only cookie  .")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var command = new LoginCommand(request.Email, request.Password);
        Result<AuthResponse> result = await sender.Send(command, ct);

        return result.ToActionResult<AuthResponse>(HttpContext);
    }

    // -------------------------------------------------------------------------
    // REFRESH TOKEN
    // -------------------------------------------------------------------------

    /// <summary>
    /// Refreshes the access and refresh tokens.
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Refreshes JWT token pair.")]
    public async Task<IActionResult> RefreshToken(CancellationToken ct)
    {
        if (!Request.Cookies.TryGetValue("refresh_token", out var refreshToken))
            return Unauthorized("Refresh token missing.");

        var command = new RefreshTokenCommand(refreshToken);

        var result = await sender.Send(command, ct);
        return result.ToActionResult(HttpContext);
    }




    /// <summary>
    /// Sends a password reset code to the user's email.
    /// </summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Generates password reset code and sends it to email.")]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgetPasswordRequest request,
        CancellationToken ct)
    {
        var command = new ForgetPasswordCommand(request.Email);
        Result result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
    }

    // -------------------------------------------------------------------------
    // RESET PASSWORD WITH CODE (NEW)
    // -------------------------------------------------------------------------

    /// <summary>
    /// Resets the user password using email + new password.
    /// </summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Resets the user's password.")]
    [EndpointDescription("Allows the user to set a new password using a valid OTP code.")]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request,
        CancellationToken ct)
    {
        var userIpAddress = HttpContext.GetClientIp();

        var command = new ResetPasswordWithCodeCommand(
            request.UserId,
            request.Code,
            request.NewPassword,
            userIpAddress
        );

        Result result = await sender.Send(command, ct);
        return result.ToActionResult(HttpContext);
    }
}