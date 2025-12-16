using MediatR;
using quiz_management_system.Contracts.Requests.Users;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.Abstraction;

namespace quiz_management_system.Application.Features.UsersFeatures.Queries.GetUsers;


public sealed record GetUsersQuery(Role? Role)
    : IRequest<Result<IReadOnlyList<UserListItemDto>>>;
