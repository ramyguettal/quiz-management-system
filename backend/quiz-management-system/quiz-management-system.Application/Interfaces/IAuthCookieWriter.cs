using quiz_management_system.Contracts.Reponses.Identity;

public interface IAuthCookieWriter
{
    void Write(AuthDto auth);
}
