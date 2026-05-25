using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RateLimiterAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddAbuseProtection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RiskScore",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "SuspiciousActivities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    RiskScore = table.Column<int>(type: "int", nullable: false),
                    IsAutoBanned = table.Column<bool>(type: "bit", nullable: false),
                    DetectedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SuspiciousActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SuspiciousActivities_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SuspiciousActivities_UserId",
                table: "SuspiciousActivities",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SuspiciousActivities");

            migrationBuilder.DropColumn(
                name: "RiskScore",
                table: "Users");
        }
    }
}
