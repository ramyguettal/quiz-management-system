using System;
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
            migrationBuilder.CreateTable(
                name: "recent_activities",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    activity_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    performed_by_id = table.Column<Guid>(type: "uuid", nullable: false),
                    performed_by_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    performed_by_role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    target_entity_id = table.Column<Guid>(type: "uuid", nullable: true),
                    target_entity_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    target_entity_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recent_activities", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_recent_activities_activity_type",
                table: "recent_activities",
                column: "activity_type");

            migrationBuilder.CreateIndex(
                name: "ix_recent_activities_cursor",
                table: "recent_activities",
                columns: new[] { "created_at_utc", "id" },
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "ix_recent_activities_performed_by_id",
                table: "recent_activities",
                column: "performed_by_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "recent_activities");
        }
    }
}
