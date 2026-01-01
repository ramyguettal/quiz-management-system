using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Helpers;
using quiz_management_system.Application.Features.Notifications.Commands.DeleteAllNotifications;
using quiz_management_system.Application.Features.Notifications.Commands.DeleteNotification;
using quiz_management_system.Application.Features.Notifications.Commands.MarkAllNotificationsAsRead;
using quiz_management_system.Application.Features.Notifications.Commands.MarkAsRead;
using quiz_management_system.Application.Features.Notifications.Queries.GetNotifications;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Requests.Notifications;
using quiz_management_system.Contracts.Responses.Notifications;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.App.Controllers;

[Route("api/notifications")]
[ApiController]
[ApiVersion("1.0")]
[Authorize]
[Tags("Notifications")]
[Produces("application/json")]
public sealed class NotificationsController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Retrieves the authenticated user's bell notifications.
    /// </summary>
    /// <remarks>
    /// Notifications are returned using cursor-based pagination for efficient scrolling.
    /// The newest notifications are returned first.
    /// </remarks>
    /// <param name="cursor">
    /// Optional pagination cursor returned from the previous request.
    /// </param>
    /// <param name="pageSize">
    /// Number of notifications to retrieve per page (default is 20).
    /// </param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// A cursor-paginated list of notifications belonging to the authenticated user.
    /// </returns>
    /// <response code="200">Notifications successfully retrieved.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet]
    [ProducesResponseType(
        typeof(CursorPagedResponse<NotificationResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Retrieves user notifications.")]
    [EndpointDescription(
        "Returns bell notifications for the authenticated user using cursor-based pagination.")]
    [EndpointName("GetNotifications")]
    public async Task<ActionResult<CursorPagedResponse<NotificationResponse>>> Get(
        [FromQuery] string? cursor,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
        =>
        (await sender.Send(
            new GetNotificationsQuery(cursor, pageSize),
            ct))
        .ToActionResult(HttpContext);

    /// <summary>
    /// Marks a single notification as read.
    /// </summary>
    /// <param name="id">The identifier of the notification to mark as read.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// No content if the notification was successfully marked as read.
    /// </returns>
    /// <response code="204">Notification successfully marked as read.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Notification not found or does not belong to the user.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPatch("{id:guid}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Marks a notification as read.")]
    [EndpointDescription(
        "Updates the read state of a single notification belonging to the authenticated user.")]
    [EndpointName("MarkNotificationAsRead")]
    public async Task<IActionResult> MarkAsRead(
        Guid id,
        CancellationToken ct)
    {
        await sender.Send(new MarkNotificationAsReadCommand(id), ct);
        return NoContent();
    }

    /// <summary>
    /// Marks all notifications as read for the authenticated user.
    /// </summary>
    /// <remarks>
    /// This operation performs a bulk update and efficiently marks all unread
    /// notifications as read in a single database operation.
    /// </remarks>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// No content if all notifications were successfully marked as read.
    /// </returns>
    /// <response code="204">All notifications successfully marked as read.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPatch("read-all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Marks all notifications as read.")]
    [EndpointDescription(
        "Marks all unread notifications for the authenticated user as read using a bulk operation.")]
    [EndpointName("MarkAllNotificationsAsRead")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct)
    {
        await sender.Send(new MarkAllNotificationsAsReadCommand(), ct);
        return NoContent();
    }
    /// <summary>
    /// Deletes multiple notifications for the authenticated user.
    /// </summary>
    /// <param name="request">Notification IDs to delete.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>No content if deleted successfully.</returns>
    /// <response code="204">Notifications deleted.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">No notifications found.</response>
    [HttpDelete("bulk")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [EndpointSummary("Deletes multiple notifications.")]
    [EndpointName("DeleteNotifications")]
    public async Task<IActionResult> DeleteMany(
        [FromBody] DeleteNotificationsRequest request,
        CancellationToken ct)
    {
        Result result = await sender.Send(
            new DeleteNotificationsCommand(request.NotificationIds), ct);

        if (result.IsFailure)
            return Problem(statusCode: StatusCodes.Status404NotFound);

        return NoContent();
    }


    /// <summary>
    /// Deletes all notifications for the authenticated user.
    /// </summary>
    /// <remarks>
    /// This operation permanently deletes all notifications belonging to the
    /// authenticated user using a single bulk database operation.
    /// <br/><br/>
    /// <b>Note:</b> This action is irreversible.
    /// </remarks>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// No content if all notifications were successfully deleted.
    /// </returns>
    /// <response code="204">All notifications successfully deleted.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="500">Internal server error.</response>
    [HttpDelete("all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Deletes all notifications.")]
    [EndpointDescription(
        "Permanently deletes all notifications for the authenticated user using a bulk delete operation.")]
    [EndpointName("DeleteAllNotifications")]
    public async Task<IActionResult> DeleteAll(CancellationToken ct)
    {
        await sender.Send(new DeleteAllNotificationsCommand(), ct);
        return NoContent();
    }



}