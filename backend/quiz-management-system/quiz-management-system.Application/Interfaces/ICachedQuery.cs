using MediatR;

namespace quiz_management_system.Application.Interfaces;

public interface ICachedQuery
{
    string CacheKey { get; }
    string[] Tags { get; }
    TimeSpan Expiration { get; }
}
public interface ICachedQuery<TResponse> : IRequest<TResponse>, ICachedQuery;