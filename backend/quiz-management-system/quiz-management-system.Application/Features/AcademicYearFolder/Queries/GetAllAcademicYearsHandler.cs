using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Requests;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.AcademicYearFolder.Queries;

public sealed class GetAllAcademicYearsHandler
    : IRequestHandler<
        GetAllAcademicYearsQuery,
        Result<IReadOnlyList<AcademicYearResponse>>>
{
    private readonly IAppDbContext context;

    public GetAllAcademicYearsHandler(IAppDbContext context)
    {
        this.context = context;
    }

    public async Task<Result<IReadOnlyList<AcademicYearResponse>>> Handle(
        GetAllAcademicYearsQuery request,
        CancellationToken ct)
    {
        List<AcademicYearResponse> years = await context.AcademicYears
            .AsNoTracking()
            .OrderBy(y => y.Number)
            .Select(y => new AcademicYearResponse(
                y.Id,
                y.Number
            ))
            .ToListAsync(ct);

        return Result.Success<IReadOnlyList<AcademicYearResponse>>(years);
    }
}