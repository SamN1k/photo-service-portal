using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PSP.DataAccessLayer.Context;

#nullable disable

namespace PSP.DataAccessLayer.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(PhotoPortalDbContext))]
    [Migration("20260529131500_AllowOfferCoverImageDataUrls")]
    public partial class AllowOfferCoverImageDataUrls : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "CoverImageUrl",
                table: "PhotoOffers",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(8192)",
                oldMaxLength: 8192);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "CoverImageUrl",
                table: "PhotoOffers",
                type: "character varying(8192)",
                maxLength: 8192,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
