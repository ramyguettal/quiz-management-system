using quiz_management_system.Domain.GroupFolder;

namespace quiz_management_system.Domain.QuizesFolder.QuizGroupFolder;

public sealed class QuizGroup
{
    public Guid QuizId { get; private set; }
    public Quiz Quiz { get; private set; } = default!;

    public Guid GroupId { get; private set; }
    public Group Group { get; private set; } = default!;

    private QuizGroup() { } // EF Core

    private QuizGroup(Quiz quiz, Group group)
    {
        Quiz = quiz;
        QuizId = quiz.Id;

        Group = group;
        GroupId = group.Id;
    }

    public static QuizGroup Create(Quiz quiz, Group group)
        => new QuizGroup(quiz, group);
}