using quiz_management_system.Domain.Common.Identity;

namespace quiz_management_system.App.Implemntation;

public static class TokenRefreshMiddlewareExtensions
{
    /// <summary>
    /// Registers the <see cref="TokenRefreshMiddleware"/> into the ASP.NET Core pipeline.
    /// <para>
    /// This MUST be called <b>before</b> <c>app.UseAuthentication()</c> so that
    /// silently refreshed tokens are injected into the request before the JWT
    /// bearer handler runs.
    /// </para>
    /// <example>
    /// Correct pipeline order:
    /// <code>
    /// app.UseTokenRefresh();      // ← must come first
    /// app.UseAuthentication();
    /// app.UseAuthorization();
    /// </code>
    /// </example>
    /// </summary>
    public static IApplicationBuilder UseTokenRefresh(this IApplicationBuilder app)
        => app.UseMiddleware<TokenRefreshMiddleware>();
}
 