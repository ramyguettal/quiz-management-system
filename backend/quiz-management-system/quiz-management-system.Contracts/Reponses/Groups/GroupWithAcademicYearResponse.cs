namespace quiz_management_system.Contracts.Reponses.Groups;

public sealed record GroupWithAcademicYearResponse(
    Guid Id,
    string GroupNumber,
    Guid AcademicYearId,
    string AcademicYearNumber
);
