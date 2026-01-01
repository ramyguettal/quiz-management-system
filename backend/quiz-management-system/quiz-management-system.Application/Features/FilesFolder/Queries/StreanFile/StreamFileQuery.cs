using quiz_management_system.Application.Features.FilesFolder.Dtos;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using MediatR;

namespace quiz_management_system.Application.Features.FilesFolder.Queries.StreanFile;

public record StreamFileQuery(Guid Id) : IRequest<Result<StreamFileDto>>;
