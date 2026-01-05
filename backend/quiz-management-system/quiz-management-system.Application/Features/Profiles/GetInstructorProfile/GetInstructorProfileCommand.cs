using MediatR;
using quiz_management_system.Contracts.Requests.Instructor;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Profiles.GetInstructorProfile;

public sealed record GetInstructorProfileQuery : IRequest<Result<InstructorProfileResponse>>;
