using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace quiz_management_system.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class init2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsTimed",
                table: "QuizQuestions");

            migrationBuilder.DropColumn(
                name: "TimeLimitInMinutes",
                table: "QuizQuestions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsTimed",
                table: "QuizQuestions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "TimeLimitInMinutes",
                table: "QuizQuestions",
                type: "integer",
                nullable: true);
        }
    }
}
