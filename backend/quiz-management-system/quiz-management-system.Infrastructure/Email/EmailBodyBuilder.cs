using Makayen.Application.Common.Interfaces;

namespace Makayen.Infrastructure.Email;

public sealed class EmailBodyBuilder : IEmailBodyBuilder
{
    public string Build(string templateHtml, IReadOnlyDictionary<string, string> model)
    {
        if (string.IsNullOrWhiteSpace(templateHtml) || model.Count == 0)
            return templateHtml;

        var body = templateHtml;

        foreach (var (key, value) in model)
        {
          
            var placeholder = $"{{{{{key}}}}}";
            body = body.Replace(placeholder, value ?? string.Empty);
        }

        return body;
    }
}