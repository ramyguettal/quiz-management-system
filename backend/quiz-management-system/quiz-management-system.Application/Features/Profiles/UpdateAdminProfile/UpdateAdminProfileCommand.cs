using MediatR;
using Microsoft.AspNetCore.Http;
using quiz_management_system.Domain.Common.ResultPattern.Result;



public sealed record UpdateAdminProfileCommand(
    string? FullName,
    bool? EmailNotifications,
    IFormFile? ProfileImage
) : IRequest<Result>;
