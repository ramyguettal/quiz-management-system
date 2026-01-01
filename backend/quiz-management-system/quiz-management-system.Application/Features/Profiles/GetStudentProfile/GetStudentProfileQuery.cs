using MediatR;
using quiz_management_system.Contracts.Requests.Student;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Profiles.GetStudentProfile;

public sealed record GetStudentProfileQuery : IRequest<Result<StudentProfileResponse>>;
