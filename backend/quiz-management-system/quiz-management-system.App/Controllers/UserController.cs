using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Features.UpdatePassword;
using quiz_management_system.Application.Features.UsersFeatures.Commands.ActivateUser;
using quiz_management_system.Application.Features.UsersFeatures.Commands.DeactivateUser;
using quiz_management_system.Application.Features.UsersFeatures.Queries.GetUsers;
using quiz_management_system.Contracts.Requests;
using quiz_management_system.Contracts.Requests.Users;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.App.Controllers;

/// <summary>
/// Handles user-related operations such as profile actions and administration queries.
/// </summary>
[ApiController]
[Route("api/users")]
[ApiVersion("1.0")]
[Authorize]
[Produces("application/json")]
public sealed class UserController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Changes the authenticated user's password.
    /// </summary>
    /// <remarks>
    /// The user must be authenticated and provide:
    /// - the current password
    /// - a new password that meets security requirements
    ///
    /// This endpoint is intended for **self-service password updates**.
    /// </remarks>
    /// <param name="request">Contains the current and new password.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <response code="200">Password changed successfully.</response>
    /// <response code="400">Validation error or weak password.</response>
    /// <response code="401">User not authenticated.</response>
    /// <response code="404">User not found.</response>
    /// <response code="409">New password is the same as the current one.</response>
    /// <response code="500">Unexpected server error.</response>
    [HttpPost("update-password")]
    [EndpointName("UpdatePassword")]
    [EndpointSummary("Update the authenticated user's password")]
    [EndpointDescription("Allows an authenticated user to change their password by providing the current password.")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdatePassword(
        [FromBody] UpdatePasswordRequest request,
        CancellationToken cancellationToken)
    {
        string userIpAddress = HttpContext.GetClientIp();

        Result result = await sender.Send(
            new UpdatePasswordCommand(
                request.CurrentPassword,
                request.NewPassword,
                UserIpAddress: userIpAddress
            ),
            cancellationToken
        );

        return result.ToActionResult(HttpContext);
    }

    /// <summary>
    /// Retrieves all active (non-deleted) users in the system.
    /// </summary>
    /// <remarks>
    /// <para>
    /// This endpoint is restricted to <b>administrators only</b>.
    /// </para>
    /// <para>
    /// The result includes only users that are:
    /// <list type="bullet">
    ///   <item><description>Not soft-deleted (<c>IsDeleted = false</c>)</description></item>
    ///   <item><description>Currently active in the system</description></item>
    /// </list>
    /// </para>
    /// <para>
    /// Intended use cases:
    /// <list type="bullet">
    ///   <item><description>Administrative dashboards</description></item>
    ///   <item><description>User management screens</description></item>
    ///   <item><description>Audit and monitoring views</description></item>
    /// </list>
    /// </para>
    /// <para>
    /// Each returned user contains:
    /// <list type="bullet">
    ///   <item><description>Full name</description></item>
    ///   <item><description>Email address</description></item>
    ///   <item><description>User role</description></item>
    ///   <item><description>Account status</description></item>
    /// </list>
    /// </para>
    /// </remarks>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Users retrieved successfully.</response>
    /// <response code="401">The caller is not authenticated.</response>
    /// <response code="403">The caller does not have administrator privileges.</response>
    [HttpGet]
    [Authorize(Roles = RoleGroups.Admins)]
    [EndpointName("GetUsers")]
    [EndpointSummary("Get all active users")]
    [EndpointDescription("Returns a list of all non-deleted users with their roles and statuses.")]
    [ProducesResponseType(typeof(IReadOnlyList<UserListItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<UserListItemDto>>> GetAll(
        CancellationToken ct)
    {
        Result<IReadOnlyList<UserListItemDto>> result =
            await sender.Send(new GetUsersQuery(), ct);

        return result.ToActionResult(HttpContext);
    }
    /// <summary>
    /// Deactivates a user account (soft delete).
    /// </summary>
    /// <remarks>
    /// <para>
    /// This operation performs a <b>soft delete</b> and does not permanently remove the user.
    /// </para>
    /// <para>
    /// Effects of this operation:
    /// <list type="bullet">
    ///   <item><description><c>IsDeleted</c> is set to <c>true</c></description></item>
    ///   <item><description>User status is set to <c>Inactive</c></description></item>
    ///   <item><description>User is immediately blocked from logging in</description></item>
    /// </list>
    /// </para>
    /// <para>
    /// The corresponding Identity user is also soft-deleted to ensure authentication is blocked.
    /// </para>
    /// <para>
    /// This action is <b>idempotent</b>. Re-deactivating an already inactive user will not cause errors.
    /// </para>
    /// </remarks>
    /// <param name="userId">The unique identifier of the user to deactivate.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">User deactivated successfully.</response>
    /// <response code="400">The request is invalid.</response>
    /// <response code="401">The caller is not authenticated.</response>
    /// <response code="403">The caller does not have administrator privileges.</response>
    /// <response code="404">User not found.</response>
    /// <response code="500">An unexpected server error occurred.</response>
    [HttpPost("{userId:guid}/deactivate")]
    [EndpointSummary("Deactivate user (soft delete).")]
    [EndpointDescription("Sets IsDeleted=true and Status=InActive. Blocks login because Identity user is soft deleted too.")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [Authorize(Roles = RoleGroups.Admins)]
    public async Task<IActionResult> Deactivate(Guid userId, CancellationToken ct)
    {
        Result result = await sender.Send(new DeactivateUserCommand(userId), ct);
        return result.ToActionResult(HttpContext);
    }



    /// <summary>
    /// Reactivates a previously deactivated (soft-deleted) user.
    /// </summary>
    /// <remarks>
    /// <para>
    /// This operation restores a user that was previously soft-deleted.
    /// </para>
    /// <para>
    /// Effects of this operation:
    /// <list type="bullet">
    ///   <item><description><c>IsDeleted</c> is set to <c>false</c></description></item>
    ///   <item><description>User status is set to <c>Active</c></description></item>
    ///   <item><description>User regains the ability to log in</description></item>
    /// </list>
    /// </para>
    /// <para>
    /// The system uses <c>IgnoreQueryFilters</c> internally to locate soft-deleted records.
    /// </para>
    /// <para>
    /// This action is <b>idempotent</b>. Activating an already active user will not cause errors.
    /// </para>
    /// </remarks>
    /// <param name="userId">The unique identifier of the user to activate.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">User activated successfully.</response>
    /// <response code="400">The request is invalid.</response>
    /// <response code="401">The caller is not authenticated.</response>
    /// <response code="403">The caller does not have administrator privileges.</response>
    /// <response code="404">User not found.</response>
    /// <response code="500">An unexpected server error occurred.</response>

    [HttpPost("{userId:guid}/activate")]
    [EndpointSummary("Activate user (restore).")]
    [EndpointDescription("Sets IsDeleted=false and Status=Active. Uses IgnoreQueryFilters to find deleted records.")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [Authorize(Roles = RoleGroups.Admins)]
    public async Task<IActionResult> Activate(Guid userId, CancellationToken ct)
    {
        Result result = await sender.Send(new ActivateUserCommand(userId), ct);
        return result.ToActionResult(HttpContext);
    }
}
