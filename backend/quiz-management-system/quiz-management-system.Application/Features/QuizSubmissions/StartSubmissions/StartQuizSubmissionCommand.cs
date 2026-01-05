using MediatR;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using System;
using System.Collections.Generic;
using System.Text;

namespace quiz_management_system.Application.Features.QuizSubmissions.StartSubmissions;

public record StartQuizSubmissionCommand(
    Guid QuizId,
    Guid StudentId
) : IRequest<Result<Guid>>;
