using MediatR;
using Microsoft.AspNetCore.Http;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Profiles.UpdateInstructorProfile;

public sealed record UpdateInstructorProfileCommand(
    string? FullName,
    string? Title,
    string? PhoneNumber,
    string? Department,
    string? OfficeLocation,
    string? Bio,
    bool? EmailNotifications,
    IFormFile? ProfileImage
) : IRequest<Result>;
