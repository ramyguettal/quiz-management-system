using Makayen.App.Helpers;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.Application.Features.Login;
using quiz_management_system.Contracts.Reponses.Identity;
using quiz_management_system.Contracts.Requests.Identity;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace Makayen.Api.Controllers;

/// <summary>
/// Handles all identity-related actions such as login, token refresh,
/// email confirmation, password reset, and verification flows.
/// </summary>
[ApiController]
[Route("api/identity")]
[Tags("Identity")]
[Produces("application/json")]
[Consumes("application/json")]
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
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var command = new LoginCommand(request.Email, request.Password);
        Result result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
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





            var command = new RefreshTokenCommand(refreshToken);
        Result<AuthResponse> result = await sender.Send(command, ct);

        return result.ToActionResult<AuthResponse>(HttpContext);
    }

    // -------------------------------------------------------------------------
    // CONFIRM EMAIL (NEW)
    // -------------------------------------------------------------------------

    /// <summary>
    /// Confirms a user's email using IdentityUserId + confirmation code.
    /// </summary>
    /// <param name="request">Identity user ID and confirmation code.</param>
    [HttpPost("confirm-email")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Confirms a user email address.")]
    [EndpointDescription("Completes the account verification process using identityId + email confirmation code.")]
    public async Task<IActionResult> ConfirmEmail(
        [FromBody] ConfirmEmailRequest request,
        CancellationToken ct)
    {
        var command = new ConfirmEmailCommand(request.IdentityId, request.Code);
        Result result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
    }

    // -------------------------------------------------------------------------
    // RESEND EMAIL CONFIRMATION (NEW)
    // -------------------------------------------------------------------------

    /// <summary>
    /// Sends a new confirmation email to the user.
    /// </summary>
    [HttpPost("resend-confirmation-email")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Resends confirmation email to the user.")]
    public async Task<IActionResult> ResendConfirmationEmail(
        [FromBody] ResendConfirmationEmailRequest request,
        CancellationToken ct)
    {
        var command = new ResendConfirmationEmailCommand(request.Email);
        Result result = await sender.Send(command, ct);

        return result.ToActionResult(HttpContext);
    }

    // -------------------------------------------------------------------------
    // FORGOT PASSWORD (NEW)
    // -------------------------------------------------------------------------

    /// <summary>
    /// Sends a password reset OTP/code to the user's email.
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
    /// Resets the user password using email + OTP code + new password.
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
        var command = new ResetPasswordWithCodeCommand(
            request.Email,
            request.Code,
            request.NewPassword
        );

        Result result = await sender.Send(command, ct);
        return result.ToActionResult(HttpContext);
    }
}
