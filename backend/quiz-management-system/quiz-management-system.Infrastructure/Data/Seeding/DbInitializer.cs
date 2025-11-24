using Dodo.Primitives;
using Makayen.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Interfaces;

namespace quiz_management_system.Infrastructure.Data.Seeding
{
    public class DbInitializer(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        IServiceProvider serviceProvider,
        IAppDbContext appDbContext
    ) : IDbInitializer
    {
        // ============================
        // 1. Seed Roles
        // ============================
        private async Task SeedRolesAndPermissionsAsync()
        {
            if (roleManager.Roles.Any()) return;


            IReadOnlyList<string> roleNames = DefaultRoles.GetAll();

            foreach (var roleName in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {

                    await roleManager.CreateAsync(new ApplicationRole
                    {

                        Name = roleName,
                        ConcurrencyStamp = Uuid.CreateVersion7().ToString(),


                    });
                }
            }
        }


        // ============================
        // 2. Seed SuperAdmin User
        // ============================
        private async Task SeedOwnerAsync()
        {
            var config = serviceProvider.GetRequiredService<IConfiguration>();

            string ownerEmail = config["SuperAdmin:Email"]!;
            string ownerPass = config["SuperAdmin:Password"]!;


            var ownerUsers = await userManager.GetUsersInRoleAsync(DefaultRoles.SuperAdmin);
            if (ownerUsers.Any())
                return;

            // -------- Identity User --------
            var ownerIdentity = await ApplicationUser.CreateWithEmail(ownerEmail);
            ownerIdentity.EmailConfirmed = true;

            IdentityResult identityResult = await userManager.CreateAsync(ownerIdentity, ownerPass);
            if (!identityResult.Succeeded)
                throw new Exception(string.Join(",", identityResult.Errors.Select(e => e.Description)));

            await userManager.AddToRoleAsync(ownerIdentity, DefaultRoles.SuperAdmin);

            // -------- Domain User --------
            var ownerDomain = User.Create(

                ownerIdentity.Id,
                firstName: DefaultUsers.SuperAdmin.FirstName,
                lastName: DefaultUsers.SuperAdmin.LastName,
                role: Domain.Users.Enums.Role.SuperAdmin,
                displayName: DefaultUsers.SuperAdmin.DisplayName,
                email: ownerEmail,
                fireEvent: false
            );

            appDbContext.Users.Add(ownerDomain.TryGetValue());
            await appDbContext.SaveChangesAsync(CancellationToken.None);
        }


        // ============================
        // 3. Seed SuperAdmin Permissions 
        // ============================

        public async Task SeedAsync()
        {

            await SeedRolesAndPermissionsAsync();
            await SeedOwnerAsync();

        }
    }
}