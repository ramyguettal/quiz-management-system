using System;
using System.Collections.Generic;
using System.Text;

namespace quiz_management_system.Contracts.Requests.Notifications;

public sealed record DeleteNotificationsRequest(
    IReadOnlyCollection<Guid> NotificationIds);