using System;
using System.Collections.Generic;
using System.Text;

namespace quiz_management_system.Contracts.Common;

public sealed record CursorPagedResponse<T>(
    IReadOnlyList<T> Items,
    string? NextCursor,
    bool HasNextPage
);
