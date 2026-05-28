using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PSP.DataAccessLayer.Context;

#nullable disable

namespace PSP.DataAccessLayer.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(PhotoPortalDbContext))]
    [Migration("20260528154000_AddPhotographerPortfolio")]
    public partial class AddPhotographerPortfolio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Users",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ProfileImageUrl",
                table: "Users",
                type: "character varying(8192)",
                maxLength: 8192,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PortfolioDescription",
                table: "Users",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PortfolioGalleryImageUrls",
                table: "Users",
                type: "character varying(16000)",
                maxLength: 16000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(
                """
                UPDATE "Users"
                SET
                    "PhoneNumber" = '+373 69 145 802',
                    "ProfileImageUrl" = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
                    "PortfolioDescription" = 'Fotograf de eveniment cu accent pe cadre naturale, lumina calda si editare editoriala. Lucrez cu nunti, cununii civile, portrete business si evenimente corporate.',
                    "PortfolioGalleryImageUrls" = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80
                https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80
                https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80
                https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80'
                WHERE "Id" = 'photo-001';
                """);

            migrationBuilder.Sql(
                """
                UPDATE "Users"
                SET
                    "PhoneNumber" = '+40 744 332 118',
                    "ProfileImageUrl" = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
                    "PortfolioDescription" = 'Fotograf de familie si evenimente restranse. Imi place sa surprind expresii sincere, detalii de decor si fotografii luminoase pentru albume personale.',
                    "PortfolioGalleryImageUrls" = 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80
                https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80
                https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80'
                WHERE "Id" = 'photo-002';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ProfileImageUrl",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PortfolioDescription",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PortfolioGalleryImageUrls",
                table: "Users");
        }
    }
}
