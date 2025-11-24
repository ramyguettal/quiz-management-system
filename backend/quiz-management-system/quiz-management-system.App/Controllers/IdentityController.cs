using Makayen.App.Helpers;
using Makayen.Application.Features.Identity.Commands.ConfirmAccount;
using Makayen.Application.Features.Identity.Commands.ForgotPassword;
using Makayen.Application.Features.Identity.Commands.Login.AsGuest;
using Makayen.Application.Features.Identity.Commands.Login.ByEmail;
using Makayen.Application.Features.Identity.Commands.Login.ByPhone;
using Makayen.Application.Features.Identity.Commands.RefreshToken;
using Makayen.Application.Features.Identity.Commands.Register.ByEmail;
using Makayen.Application.Features.Identity.Commands.Register.ByPhone;
using Makayen.Application.Features.Identity.Commands.ResendConfirmation;
using Makayen.Application.Features.Identity.Commands.ResetPassword;
using Makayen.Application.Features.Identity.Commands.VerifyOtp;
using Makayen.Contracts.Requests.Identity;
using Makayen.Contracts.Responses.Identity;
using Makayen.Domain.Common.ResultPattern.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Makayen.Api.Controllers;

/// <summary>
/// Handles user authentication, registration, and token management.
/// </summary>
/// <remarks>
/// This controller provides endpoints for:
/// - Registering new users via email or phone
/// - Authenticating existing users (email, phone, guest)
/// - Refreshing JWT tokens using a valid refresh token
/// </remarks>
[ApiController]
[Route("api/identity")]
[Tags("Identity")]
[Produces("application/json")]
[Consumes("application/json")]
public sealed class IdentityController(ISender sender) : ControllerBase
{

    /// <summary>
    /// Registers a new user using an email address and password.
    /// </summary>
    /// <param name="request">The user registration request containing email, name, and password details.</param>
    /// <param name="ct">A cancellation token to cancel the request.</param>
    /// <returns>
    /// An <see cref="IActionResult"/> indicating the success or failure of registration.  
    /// The response does not contain JWT tokens.  
    /// A confirmation email is sent to the user to verify their account.
    /// </returns>
    /// <response code="200">
    /// Registration succeeded. A confirmation link has been sent to the provided email address.
    /// </response>
    /// <response code="400">Validation failure or invalid input data (e.g., malformed email, weak password).</response>
    /// <response code="409">A user with the same email already exists.</response>
    /// <response code="500">Internal server error while processing registration.</response>
    [HttpPost("register/email")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Registers a user by email and sends a confirmation link.")]
    [EndpointDescription("Creates a new user account using email credentials and sends a verification email.")]
    [EndpointName("RegisterByEmail")]
    public async Task<IActionResult> RegisterByEmail([FromBody] RegisterByEmailRequest request, CancellationToken ct)
    {
        var command = new RegisterByEmailCommand(
            request.Email,
            request.FirstName,
            request.LastName,
            request.Password);

        Result result = await sender.Send(command, ct);
        return result.ToActionResult(HttpContext);
    }


    /// <summary>
    /// Registers a new user using a phone number and password.
    /// </summary>
    /// <param name="request">The user registration request containing phone number, name, and password details.</param>
    /// <param name="ct">A cancellation token to cancel the request.</param>
    /// <returns>
    /// An <see cref="IActionResult"/> indicating the success or failure of registration.  
    /// The response does not contain JWT tokens.  
    /// A one-time password (OTP) SMS is sent to the provided phone number for verification.
    /// </returns>
    /// <response code="200">
    /// Registration succeeded. An OTP code has been sent to the provided phone number for verification.
    /// </response>
    /// <response code="400">Validation failure or invalid input data (e.g., incorrect phone format, weak password).</response>
    /// <response code="409">A user with the same phone number already exists.</response>
    /// <response code="500">Internal server error while processing registration.</response>
    [HttpPost("register/phone")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Registers a user by phone number and sends OTP for verification.")]
    [EndpointDescription("Creates a new user account using phone credentials and sends an OTP SMS to verify the number.")]
    [EndpointName("RegisterByPhone")]
    public async Task<IActionResult> RegisterByPhone([FromBody] RegisterByPhoneRequest request, CancellationToken ct)
    {
        var command = new RegisterByPhoneCommand(
            request.PhoneNumber,
            request.FirstName,
            request.LastName,
            request.Password);

        Result result = await sender.Send(command, ct);
        return result.ToActionResult(HttpContext);
    }


    /// <summary>
    /// Authenticates a user using email and password credentials.
    /// </summary>
    /// <param name="request">User login request containing email and password.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>An <see cref="AuthResponse"/> containing JWT and refresh tokens.</returns>
    /// <response code="200">Login successful; returns new token pair.</response>
    /// <response code="400">Validation failure or invalid credentials.</response>
    /// <response code="401">Unauthorized – invalid email or password.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("login/email")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Authenticates a user by email.")]
    [EndpointDescription("Validates email and password credentials, then issues new JWT and Refresh tokens.")]
    [EndpointName("LoginByEmail")]
    public async Task<ActionResult<AuthResponse>> LoginByEmail([FromBody] LoginByEmailRequest request, CancellationToken ct)
    {
        var command = new LoginByEmailCommand(request.Email, request.Password);
        Result<AuthResponse> result = await sender.Send(command, ct);
        return result.ToActionResult(HttpContext);
    }


    /// <summary>
    /// Authenticates a user using phone number and password credentials.
    /// </summary>
    /// <param name="request">Phone login request containing phone number and password.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>An <see cref="AuthResponse"/> containing JWT and refresh tokens.</returns>
    /// <response code="200">Login successful; returns new token pair.</response>
    /// <response code="400">Validation failure or invalid credentials.</response>
    /// <response code="401">Unauthorized – invalid phone or password.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("login/phone")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Authenticates a user by phone number.")]
    [EndpointDescription("Validates phone number and password credentials, then issues new JWT and Refresh tokens.")]
    [EndpointName("LoginByPhone")]
    public async Task<ActionResult<AuthResponse>> LoginByPhone([FromBody] LoginByPhoneRequest request, CancellationToken ct)
    {
        var command = new LoginByPhoneCommand(request.PhoneNumber, request.Password);
        Result<AuthResponse> result = await sender.Send(command, ct);
        return result.ToActionResult<AuthResponse>(HttpContext);
    }


    /// <summary>
    /// Creates a guest user session and returns a token pair.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>An <see cref="AuthResponse"/> containing JWT and refresh tokens for a guest session.</returns>
    /// <response code="200">Guest login successful; returns token pair.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("login/guest")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Creates a temporary guest user session.")]
    [EndpointDescription("Generates an anonymous guest account and returns JWT and Refresh tokens for limited access.")]
    [EndpointName("LoginAsGuest")]
    public async Task<ActionResult<AuthResponse>> LoginAsGuest(LoginAsGuestRequest request, CancellationToken ct)
    {
        var command = new LoginAsGuestCommand(request.DeviceId);
        Result<AuthResponse> result = await sender.Send(command, ct);
        return result.ToActionResult<AuthResponse>(HttpContext);
    }


    /// <summary>
    /// Refreshes access and refresh tokens using a valid refresh token.
    /// </summary>
    /// <param name="request">Refresh token request containing expired access token and refresh token.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>An <see cref="AuthResponse"/> containing a new JWT and refresh token pair.</returns>
    /// <response code="200">New token pair successfully generated.</response>
    /// <response code="400">Validation failure or invalid refresh token.</response>
    /// <response code="401">Unauthorized – refresh token invalid or expired.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Refreshes JWT and refresh token pair.")]
    [EndpointDescription("Exchanges an expired access token and valid refresh token for a new JWT + Refresh token pair.")]
    [EndpointName("RefreshToken")]
    public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request, CancellationToken ct)
    {
        var command = new RefreshTokenCommand(request.RefreshToken, request.ExpiredAccessToken);
        Result<AuthResponse> result = await sender.Send(command, ct);
        return result.ToActionResult<AuthResponse>(HttpContext);
    }


    /// <summary>
    /// Confirms a user account (email or phone) using a valid OTP.
    /// </summary>
    /// <param name="request">Request containing email/phone and OTP code.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>An IActionResult indicating success or failure.</returns>
    /// <response code="200">Account successfully confirmed.</response>
    /// <response code="400">Invalid data or expired OTP.</response>
    /// <response code="404">User not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("confirm-account")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Confirms a user account using OTP.")]
    [EndpointDescription("Validates OTP for email or phone and activates the user account.")]
    [EndpointName("ConfirmAccount")]
    public async Task<IActionResult> ConfirmAccount([FromBody] ConfirmAccountRequest request, CancellationToken ct)
    {
        var command = new ConfirmAccountCommand(request.EmailOrPhone, request.Otp);

        Result result = await sender.Send(command, ct);
        return result.ToActionResult(HttpContext);
    }

    /// <summary>
    /// Resends account confirmation OTP to email or phone.
    /// </summary>
    /// <param name="request">Object containing email or phone.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Success if OTP resent, or failure if already confirmed or user not found.</returns>
    [HttpPost("confirm-account/otp/resend")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Resends the confirmation OTP code to email or phone.")]
    [EndpointDescription("Allows users to request another OTP for confirming their account.")]
    [EndpointName("ResendConfirmationOtp")]
    public async Task<IActionResult> ResendConfirmationOtp(
        [FromBody] ResendConfirmationRequest request,
        CancellationToken ct)
    {
        var command = new ResendConfirmationCommand(request.EmailOrPhone);

        Result result = await sender.Send(command, ct);
        return result.ToActionResult(HttpContext);
    }


    /// <summary>
    /// Sends and Resend an OTP code to the user for resetting their password.
    /// </summary>
    /// <param name="request">Object containing the email or phone number of the user.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>
    /// An <see cref="IActionResult"/> indicating whether the OTP was successfully sent.
    /// </returns>
    /// <response code="200">OTP successfully sent to email or phone.</response>
    /// <response code="400">Invalid email/phone format or validation failure.</response>
    /// <response code="404">User not found.</response>
    /// <response code="409">User email or phone is not confirmed.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("reset-password/otp/send")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Sends OTP to email or phone for resetting the password.")]
    [EndpointDescription("Generates and sends a password-reset OTP to the provided email or phone number.")]
    [EndpointName("SendResetPasswordOtp")]
    public async Task<IActionResult> SendResetPasswordOtp(
        [FromBody] ResetPasswordOtpSendRequest request,
        CancellationToken cancellationToken)
    {
        var command = new ResetPasswordOtpSendCommand(request.EmailOrPhone);
        Result res = await sender.Send(command, cancellationToken);
        return res.ToActionResult(HttpContext);
    }






    /// <summary>
    /// Verifies a password-reset OTP sent to the user.
    /// </summary>
    /// <param name="request">Object containing email/phone and the OTP code.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>
    /// An <see cref="IActionResult"/> indicating whether the OTP is valid.
    /// </returns>
    /// <response code="200">OTP is valid. User may now reset the password.</response>
    /// <response code="400">Invalid OTP format or expired OTP.</response>
    /// <response code="404">User or OTP key not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("reset-password/otp/verify")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Verifies OTP for resetting the password.")]
    [EndpointDescription("Checks whether a password-reset OTP is correct and has not expired.")]
    [EndpointName("VerifyResetPasswordOtp")]
    public async Task<IActionResult> VerifyResetPasswordOtp(
        [FromBody] VerifyOtpRequest request,
        CancellationToken cancellationToken)
    {
        var command = new VerifyOtpCommand(request.EmailOrPhone, request.Otp);
        Result res = await sender.Send(command, cancellationToken);
        return res.ToActionResult(HttpContext);
    }



    /// <summary>
    /// Resets the user password after OTP verification.
    /// </summary>
    /// <param name="request">Object containing email/phone and the new password.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>
    /// An <see cref="IActionResult"/> indicating whether the password was successfully reset.
    /// </returns>
    /// <response code="200">Password successfully reset.</response>
    /// <response code="400">Weak password or validation failure.</response>
    /// <response code="404">User not found.</response>
    /// <response code="409">User has not confirmed email/phone.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Resets the user's password.")]
    [EndpointDescription("Allows users to set a new password once OTP verification succeeds.")]
    [EndpointName("ResetPassword")]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        string userIpAddress = HttpContext.GetClientIp();

        var command = new ResetPasswordCommand(request.EmailOrPhone, request.NewPassword, userIpAddress);
        Result result = await sender.Send(command, cancellationToken);
        return result.ToActionResult(HttpContext);
    }





}
