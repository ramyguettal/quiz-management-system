using Microsoft.AspNetCore.Mvc;
using quiz_management_system.App.Controllers;

namespace quiz_management_system.App.Implemntation;

public sealed class FileUrlBuilder(HttpContext httpContext, IUrlHelper url) : IUrlBuilder
{


    public string? GetUrl(Guid? id)
    {
        if (!id.HasValue)
            return null;

        return url.Action(
            nameof(FilesController.GetFile),
            "Files",
            new { id = id.Value },
            httpContext.Request.Scheme
        );
    }
}
