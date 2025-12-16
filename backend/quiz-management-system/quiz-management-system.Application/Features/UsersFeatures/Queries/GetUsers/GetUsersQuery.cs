using MediatR;
using quiz_management_system.Contracts.Requests.Users;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.UsersFeatures.Queries.GetUsers;


public sealed record GetUsersQuery
    : IRequest<Result<IReadOnlyList<UserListItemDto>>>;
