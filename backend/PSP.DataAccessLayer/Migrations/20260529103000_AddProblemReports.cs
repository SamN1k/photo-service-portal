using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PSP.DataAccessLayer.Context;

#nullable disable

namespace PSP.DataAccessLayer.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(PhotoPortalDbContext))]
    [Migration("20260529103000_AddProblemReports")]
    public partial class AddProblemReports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProblemReports",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ReporterId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ReporterName = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    ReporterEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ReporterRole = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Title = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProblemReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProblemReports_Users_ReporterId",
                        column: x => x.ReporterId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProblemReports_CreatedAt",
                table: "ProblemReports",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ProblemReports_ReporterId",
                table: "ProblemReports",
                column: "ReporterId");

            migrationBuilder.CreateIndex(
                name: "IX_ProblemReports_ReporterRole",
                table: "ProblemReports",
                column: "ReporterRole");

            migrationBuilder.CreateIndex(
                name: "IX_ProblemReports_Status",
                table: "ProblemReports",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProblemReports");
        }
    }
}
