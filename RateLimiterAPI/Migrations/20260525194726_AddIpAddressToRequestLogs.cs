using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RateLimiterAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddIpAddressToRequestLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IpAddress",
                table: "RequestLogs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IpAddress",
                table: "RequestLogs");
        }
    }
}
