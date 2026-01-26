using MediatR;
using Microsoft.AspNetCore.Http;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Profiles.UpdateStudentProfile;

public sealed record UpdateStudentProfileCommand(
    string? FullName,
    bool? EmailNotifications,
    IFormFile? ProfileImage
) : IRequest<Result>;
