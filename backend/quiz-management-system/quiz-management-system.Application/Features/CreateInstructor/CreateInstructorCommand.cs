using MediatR;
using quiz_management_system.Contracts.Reponses.Instructor;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.CreateInstructor;

public sealed record CreateInstructorCommand(
    string Email,
    string FullName,
    string Title,
    string PhoneNumber,
    string Department,
    string OfficeLocation,
    string Bio
) : IRequest<Result<InstructorResponse>>;
