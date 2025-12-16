using Mapster;
using quiz_management_system.Application.Dtos;
using quiz_management_system.Contracts.Reponses.Identity;
using quiz_management_system.Infrastructure.Idenitity;

namespace quiz_management_system.App.MappingConfigurations;

public class MappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {


        config.NewConfig<(ApplicationUser user, string? role), AuthenticatedUser>()
           .Map(des => des.Email, src => src.user.Email)
           .Map(des => des.Id, src => src.user.Id)
           .Map(des => des.FullName, src => src.user.UserName)
           .Map(des => des.Role, src => src.role);


        config.NewConfig<(ApplicationUser user, string role), IdentityRegistrationResult>()
           .Map(des => des.IdentityUserId, src => src.user.Id)
           .Map(des => des.FullName, src => src.user.UserName)
           .Map(des => des.Email, src => src.user.Email)
           .Map(des => des.Role, src => src.role);

        config.NewConfig<AuthenticatedUser, AuthResponse>()
             .Map(des => des.UserId, src => src.Id)
           .Map(des => des.FullName, src => src.FullName)
           .Map(des => des.Email, src => src.Email)
           .Map(des => des.Role, src => src.Role);



        config.NewConfig<AuthDto, AuthResponse>()
             .Map(des => des.UserId, src => src.UserId)
           .Map(des => des.FullName, src => src.FullName)
           .Map(des => des.Email, src => src.Email)
           .Map(des => des.Role, src => src.Role);

    }
}