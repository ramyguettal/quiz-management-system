using MediatR;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Instructor;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.InstructorsFolders;

namespace quiz_management_system.Application.Features.CreateInstructor;

public sealed class CreateInstructorHandler(
    IIdentityService identityService,
    IAppDbContext db
) : IRequestHandler<CreateInstructorCommand, Result<InstructorResponse>>
{
    public async Task<Result<InstructorResponse>> Handle(
        CreateInstructorCommand request,
        CancellationToken ct)
    {


        string username = string.Concat(
    request.FullName
        .Trim()
        .Split(' ', StringSplitOptions.RemoveEmptyEntries)
);

        var registrationResult = await identityService.CreateIdentityByEmailAsync(
            request.Email,
            username,
            DefaultRoles.Instructor,
            ct
        );

        if (registrationResult.IsFailure)
            return Result.Failure<InstructorResponse>(registrationResult.TryGetError());

        var reg = registrationResult.TryGetValue();
        Guid id = Guid.Parse(reg.IdentityUserId);

        var instructorResult = Instructor.Create(
            id,
            reg.FullName,
            reg.Email,
            request.Title,
            request.PhoneNumber,
            request.Department,
            request.OfficeLocation,
            request.Bio
        );

        if (instructorResult.IsFailure)
            return Result.Failure<InstructorResponse>(instructorResult.TryGetError());

        var instructor = instructorResult.TryGetValue();

        db.Instructors.Add(instructor);
        await db.SaveChangesAsync(ct);

        return Result.Success(new InstructorResponse(
            instructor.Id,
            instructor.FullName,
            instructor.Email,
            instructor.Title,
            instructor.PhoneNumber,
            instructor.Department,
            instructor.OfficeLocation,
            instructor.Bio,
            instructor.Status
        ));
    }
}
