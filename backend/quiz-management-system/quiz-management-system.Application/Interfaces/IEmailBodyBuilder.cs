namespace quiz_management_system.Application.Interfaces;

public interface IEmailBodyBuilder : IScopedService

{
    string Build(
        string templateHtml,
        IReadOnlyDictionary<string, string> model);
}
