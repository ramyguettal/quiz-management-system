using MediatR;
using quiz_management_system.Contracts.Reponses.Dashboards;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Dashboard;

public sealed record GetInstructorDashboardStatsQuery : IRequest<Result<AdminDashboardStatsResponse>>;

