using MediatR;
using quiz_management_system.Contracts.Reponses.Admin;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.CreateAdmin;

public sealed record CreateAdminCommand(
    string Email,
    string FullName
) : IRequest<Result<AdminResponse>>;
