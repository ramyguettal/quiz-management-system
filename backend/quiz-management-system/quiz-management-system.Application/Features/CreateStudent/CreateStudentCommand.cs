using MediatR;
using quiz_management_system.Contracts.Reponses.Student;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.CreateStudent;

public sealed record CreateStudentCommand(
    string Email,
    string FullName,
    string AcademicYear,
    string GroupNumber,
    float AverageGrade
) : IRequest<Result<StudentResponse>>;
