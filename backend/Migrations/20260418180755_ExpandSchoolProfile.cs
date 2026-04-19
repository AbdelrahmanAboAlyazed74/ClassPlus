using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClassPlusBackend.Migrations
{
    /// <inheritdoc />
    public partial class ExpandSchoolProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CurriculaFiles",
                table: "SchoolProfiles",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "EducationalStages",
                table: "SchoolProfiles",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurriculaFiles",
                table: "SchoolProfiles");

            migrationBuilder.DropColumn(
                name: "EducationalStages",
                table: "SchoolProfiles");
        }
    }
}
