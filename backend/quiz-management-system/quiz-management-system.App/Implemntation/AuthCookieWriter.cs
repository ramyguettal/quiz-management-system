using quiz_management_system.Contracts.Reponses.Identity;

namespace quiz_management_system.App.Implemntation;

public sealed class AuthCookieWriter(
    IHttpContextAccessor httpContextAccessor
) : IAuthCookieWriter
{
    private readonly HttpResponse response =
        httpContextAccessor.HttpContext!.Response;

    public void Write(AuthDto auth)
    {
        response.Cookies.Append(
            "access_token",
            auth.JwtToken.Token,
            CreateAccessTokenOptions(auth.JwtToken.ExpiresAt));

        response.Cookies.Append(
            "refresh_token",
            auth.RefreshToken.Token,
            CreateRefreshTokenOptions(auth.RefreshToken.ExpiresAt));
    }

    private static CookieOptions CreateAccessTokenOptions(DateTime expiresAt) =>
        new()
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = expiresAt,
            Path = "/"
        };

    private static CookieOptions CreateRefreshTokenOptions(DateTime expiresAt) =>
        new()
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = expiresAt,
            Path = "/"
        };

    public void Clear()
    {
        CookieOptions options = new()
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/"
        };

        response.Cookies.Delete("access_token", options);
        response.Cookies.Delete("refresh_token", options);
    }
}
