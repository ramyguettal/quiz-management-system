
using quiz_management_system.Application.Dtos;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Interfaces;

public interface IIdentityService : IScopedService
{
    Task<bool> IsInRoleAsync(string userId, string role);


    Task<Result<AuthenticatedUser>> AuthenticateByEmailAsync(string email, string password);


    Task<Result<AuthenticatedUser>> GetUserByIdAsync(string userId);

    Task<Result<string>> GetFullNameAsync(string userId);


    Task<Result<IdentityRegistrationResult>> CreateIdentity4ByEmailAsync(string email, string password, string firstName, string lastName, CancellationToken cancellationToken);
    public Task<Result> ConfirmUserAsync(string emailOrPhone, CancellationToken ct);
    public Task<Result> ChangePasswordAsync(string userId, string currentPassword, string NewPassword);


    Task<Result<AuthenticatedUser>> FindUserByEmailAsync(string email);

    public Task<Result> ResetPasswordAsync(string userId, string newPassword, CancellationToken cancellationToken);
    public Task<Result> IsUserConfirmedAsync(string emailOrPhone, CancellationToken ct);
    public Task<Result> IsUserNotConfirmedAsync(string emailOrPhone, CancellationToken ct);




}
