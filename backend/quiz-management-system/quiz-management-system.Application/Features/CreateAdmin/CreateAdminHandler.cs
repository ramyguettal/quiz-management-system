using MediatR;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Reponses.Admin;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Users.AdminFolder;

namespace quiz_management_system.Application.Features.CreateAdmin;

public sealed class CreateAdminHandler(
    IIdentityService identityService,
    IAppDbContext db
) : IRequestHandler<CreateAdminCommand, Result<AdminResponse>>
{
    public async Task<Result<AdminResponse>> Handle(
        CreateAdminCommand request,
        CancellationToken ct)
    {

        var registrationResult = await identityService.CreateIdentityByEmailAsync(
            request.Email,
            request.FullName,
            DefaultRoles.Admin,
            ct
        );

        if (registrationResult.IsFailure)
            return Result.Failure<AdminResponse>(registrationResult.TryGetError());

        var reg = registrationResult.TryGetValue();
        Guid id = Guid.Parse(reg.IdentityUserId);

        var adminResult = Admin.Create(id, reg.FullName, reg.Email, fireEvent: true);
        if (adminResult.IsFailure)
            return Result.Failure<AdminResponse>(adminResult.TryGetError());

        var admin = adminResult.TryGetValue();

        db.Admins.Add(admin);
        await db.SaveChangesAsync(ct);

        return Result.Success(new AdminResponse(
            admin.Id,
            admin.FullName,
            admin.Email
        ));
    }
}