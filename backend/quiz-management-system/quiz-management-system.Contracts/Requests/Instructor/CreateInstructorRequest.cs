namespace quiz_management_system.Contracts.Requests.Instructor;

public sealed record CreateInstructorRequest(
    string Email,
    string FullName,
    string Title,
    string PhoneNumber,
    string Department,
    string OfficeLocation,
    string Bio
);
