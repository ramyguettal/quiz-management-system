using MediatR;
using quiz_management_system.Contracts.Reponses.Quizzes;
using quiz_management_system.Domain.Common.ResultPattern.Result;

public record GetQuizzesForCourseQuery(Guid CourseId)
    : IRequest<Result<CourseQuizzesOverview>>;
