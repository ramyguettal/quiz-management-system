using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Reponses.Quizzes;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder;
using quiz_management_system.Domain.QuizesFolder.Abstraction;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;

namespace quiz_management_system.Application.Features.Quizzes.GetQuizById;

public class GetQuizByIdQueryHandler(IAppDbContext _context) : IRequestHandler<GetQuizByIdQuery, Result<QuizResponse>>
{


    public async Task<Result<QuizResponse>> Handle(GetQuizByIdQuery request, CancellationToken ct)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Course)
            .Include(q => q.Questions)
                .ThenInclude(q => (q as MultipleChoiceQuestion).Options)
            .Include(q => q.Groups)
                .ThenInclude(qg => qg.Group)
            .FirstOrDefaultAsync(q => q.Id == request.QuizId, ct);

        if (quiz == null)
            return Result.Failure<QuizResponse>(
                DomainError.NotFound(nameof(Quiz), request.QuizId));

        var dto = MapToDto(quiz);
        return Result.Success(dto);
    }

    private QuizResponse MapToDto(Quiz quiz)
    {
        return new QuizResponse(
            quiz.Id,
            quiz.Title,
            quiz.Description,
            quiz.CourseId,
            quiz.Course.Title,
            quiz.AvailableFromUtc,
            quiz.AvailableToUtc,
            quiz.ShuffleQuestions,
            quiz.ShowResultsImmediately,
            quiz.AllowEditAfterSubmission,
            quiz.Status.ToString(),
            quiz.ResultsReleased,
            quiz.Questions.OrderBy(q => q.Order).Select(MapQuestionToDto).ToList(),
            quiz.Groups.Select(g => new GroupResponse(g.GroupId, g.Group.GroupNumber)).ToList(),
            quiz.CreatedAtUtc,
            quiz.LastModifiedUtc
        );
    }

    private QuestionDto MapQuestionToDto(QuizQuestion q)
    {
        if (q is MultipleChoiceQuestion mcq)
        {
            return new QuestionDto(
                mcq.Id,
                "MultipleChoice",
                mcq.Text,
                mcq.Points,
                mcq.Order,
                mcq.ShuffleOptions,
                mcq.Options.Select(o => new OptionDto(o.Id, o.Text, o.IsCorrect)).ToList(),
                null
            );
        }
        else if (q is ShortAnswerQuestion saq)
        {
            return new QuestionDto(
                saq.Id,
                "ShortAnswer",
                saq.Text,
                saq.Points,
                saq.Order,
                null,
                null,
                saq.ExpectedAnswer
            );
        }

        throw new InvalidOperationException("Unknown question type");
    }
}
