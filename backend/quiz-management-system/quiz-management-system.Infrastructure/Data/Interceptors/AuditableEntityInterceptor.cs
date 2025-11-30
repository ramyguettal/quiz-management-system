using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Users.Abstraction;

namespace quiz_management_system.Infrastructure.Data.Interceptors
{
    public class AuditableEntityInterceptor(IUserContext user) : SaveChangesInterceptor
    {
        public override InterceptionResult<int> SavingChanges(
            DbContextEventData eventData,
            InterceptionResult<int> result)
        {
            if (eventData.Context is not IAppDbContext context)
                return result;
            if (context.DisableAuditing)
                return result;
            ApplyAuditing(eventData);
            return result;
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            if (eventData.Context is not IAppDbContext context)
                return new(result);
            if (context.DisableAuditing)
                return new(result);
            ApplyAuditing(eventData);
            return new(result);
        }

        private void ApplyAuditing(DbContextEventData eventData)
        {
            var entries = eventData.Context.ChangeTracker.Entries<IAuditableEntity>();
            var currentUserId = user.UserId;

            foreach (var entityEntry in entries)
            {
                if (entityEntry.State == EntityState.Added)
                {

                    var auditUserId = currentUserId;

                    if (string.IsNullOrEmpty(auditUserId) && entityEntry.Entity is DomainUser appUser)
                    {
                        auditUserId = appUser.Id.ToString();
                    }

                    entityEntry.Property(x => x.CreatedBy).CurrentValue = auditUserId;
                    entityEntry.Property(x => x.CreatedAtUtc).CurrentValue = DateTimeOffset.UtcNow;
                }
                else if (entityEntry.State == EntityState.Modified)
                {

                    if (string.IsNullOrEmpty(currentUserId))
                        continue;

                    entityEntry.Property(x => x.LastModifiedBy).CurrentValue = currentUserId;
                    entityEntry.Property(x => x.LastModifiedUtc).CurrentValue = DateTimeOffset.UtcNow;
                }
            }
        }
    }
}