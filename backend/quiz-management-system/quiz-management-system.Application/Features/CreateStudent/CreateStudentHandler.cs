using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Dtos;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Student;
using quiz_management_system.Domain.AcademicYearFolder;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.StudentsFolder;

namespace quiz_management_system.Application.Features.CreateStudent;

public sealed class CreateStudentHandler(IIdentityService identityService, IAppDbContext db)
    : IRequestHandler<CreateStudentCommand, Result<StudentResponse>>
{


    public async Task<Result<StudentResponse>> Handle(
        CreateStudentCommand request,
        CancellationToken ct)
    {
        Result<IdentityRegistrationResult> registrationResult =
            await identityService.CreateIdentityByEmailAsync(request.Email, request.FullName, DefaultRoles.Student, ct);


        if (registrationResult.IsFailure)
            return Result.Failure<StudentResponse>(registrationResult.TryGetError());


        AcademicYear? year = await db.AcademicYears
           .Include(x => x.Courses)
    .FirstOrDefaultAsync(x => x.Number == request.AcademicYear, ct);

        if (year is null)
            return Result.Failure<StudentResponse>(
                DomainError.NotFound(nameof(AcademicYear))
            );

        IdentityRegistrationResult identityRegistrationResult = registrationResult.TryGetValue();
        Guid Guid = Guid.Parse(identityRegistrationResult.IdentityUserId);

        var studentResult = Student.Create(Guid, identityRegistrationResult.Email, identityRegistrationResult.FullName, year);

        if (studentResult.IsFailure)
            return Result.Failure<StudentResponse>(studentResult.TryGetError());

        Student student = studentResult.TryGetValue();

        var group = await db.Groups.FirstOrDefaultAsync(
            x => x.GroupNumber == request.GroupNumber, ct);




        if (group != null)
            group.AddStudent(student);


        db.Students.Add(student);
        await db.SaveChangesAsync(ct);



        return Result.Success(
            new StudentResponse(student.Id,
            student.FullName,
            student.Email,
            year.Number,
            year.Courses.Count(),
            0,
            student.Status));
    }
}
