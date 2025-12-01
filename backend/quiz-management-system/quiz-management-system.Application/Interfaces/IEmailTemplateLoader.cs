namespace quiz_management_system.Application.Interfaces;

public interface IEmailTemplateLoader : IScopedService
{
    Task<string> LoadTemplateAsync(string templateName, CancellationToken cancellationToken = default);
}