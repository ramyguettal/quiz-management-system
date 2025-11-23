using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Infrastructure.Common.Errors;

namespace quiz_management_system.Infrastructure.Idenitity
{
    public sealed record IdentityUserError(InfrastructureErrorCode InfrastructureErrorCode, string Type, string Description)
        : Error(InfrastructureErrorCode, Type, Description)
    {
        public static readonly IdentityUserError None =
            new(InfrastructureErrorCode.None, "IdentityUser.None", string.Empty);

        // Authentication errors - 401
        public static IdentityUserError InvalidCredentials(string description = "Invalid email or password") =>
            new(InfrastructureErrorCode.Authentication, "IdentityUser.InvalidCredentials", description);

        public static IdentityUserError PasswordMismatch(string description = "Current password is incorrect") =>
            new(InfrastructureErrorCode.Authentication, "IdentityUser.PasswordMismatch", description);

        // Not Found errors - 404/500
        public static IdentityUserError NotFound(string description = "Identity user not found") =>
            new(InfrastructureErrorCode.NotFound, "IdentityUser.NotFound", description);

        // Validation/State errors - 400
        public static IdentityUserError EmailNotConfirmed(string description = "Email not confirmed") =>
            new(InfrastructureErrorCode.Validation, "IdentityUser.EmailNotConfirmed", description);

        public static IdentityUserError PhoneNotConfirmed(string description = "Phone number not confirmed") =>
            new(InfrastructureErrorCode.Validation, "IdentityUser.PhoneNotConfirmed", description);

        public static IdentityUserError DuplicateEmail(string description = "Email already registered") =>
            new(InfrastructureErrorCode.Validation, "IdentityUser.DuplicateEmail", description);

        public static IdentityUserError DuplicatePhone(string description = "Phone number already registered") =>
            new(InfrastructureErrorCode.Validation, "IdentityUser.DuplicatePhone", description);

        public static IdentityUserError DuplicatedConfirmation(string description = "User already confirmed") =>
            new(InfrastructureErrorCode.Validation, "IdentityUser.DuplicatedConfirmation", description);

        public static IdentityUserError ValidationFailed(string description = "User validation failed") =>
            new(InfrastructureErrorCode.Validation, "IdentityUser.ValidationFailed", description);

        public static IdentityUserError WeakPassword(string description = "Password does not meet security requirements") =>
            new(InfrastructureErrorCode.Validation, "IdentityUser.WeakPassword", description);

        public static IdentityUserError SamePassword(string description = "New password cannot be the same as the current password") =>
            new(InfrastructureErrorCode.Validation, "IdentityUser.SamePassword", description);

        public static IdentityUserError UnverifiedAccount(string description = "User must verify email or phone before proceeding") =>
            new(InfrastructureErrorCode.Validation, "IdentityUser.UnverifiedAccount", description);

        // Database/Operation errors - 500/502
        public static IdentityUserError CreationFailed(string description = "Unable to create identity user") =>
            new(InfrastructureErrorCode.Database, "IdentityUser.CreationFailed", description);

        public static IdentityUserError UpdateFailed(string description = "Failed to update identity user") =>
            new(InfrastructureErrorCode.Database, "IdentityUser.UpdateFailed", description);

        public static IdentityUserError Conflict(string description = "Identity user conflict occurred") =>
            new(InfrastructureErrorCode.Database, "IdentityUser.Conflict", description);

        public static IdentityUserError PasswordChangeFailed(string description = "Failed to change password") =>
            new(InfrastructureErrorCode.ExternalService, "IdentityUser.PasswordChangeFailed", description);

        public static IdentityUserError PasswordResetFailed(string description = "Failed to reset password") =>
            new(InfrastructureErrorCode.ExternalService, "IdentityUser.PasswordResetFailed", description);

        public static IdentityUserError OperationFailed(string description = "Identity operation failed") =>
            new(InfrastructureErrorCode.ExternalService, "IdentityUser.OperationFailed", description);


        public static IdentityUserError Banned(string description = "Your account is banned.")
        => new(InfrastructureErrorCode.Forbidden, "IdentityUser.Banned", description);

        public static IdentityUserError Suspended(string description = "Your account is suspended.")
            => new(InfrastructureErrorCode.Forbidden, "IdentityUser.Suspended", description);

        public static IdentityUserError Deactivated(string description = "Your account is deactivated.")
            => new(InfrastructureErrorCode.Forbidden, "IdentityUser.Deactivated", description);

    }
}