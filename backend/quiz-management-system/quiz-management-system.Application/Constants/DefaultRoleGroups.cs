namespace quiz_management_system.Application.Constants;

public static class RoleGroups
{
    public const string SuperAdmin = $"{DefaultRoles.Admin},{DefaultRoles.SuperAdmin}";
    public const string Admins = $"{DefaultRoles.Admin},{DefaultRoles.SuperAdmin}";
}
