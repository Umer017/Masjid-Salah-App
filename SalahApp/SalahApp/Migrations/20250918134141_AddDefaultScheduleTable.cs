using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SalahApp.Migrations
{
    /// <inheritdoc />
    public partial class AddDefaultScheduleTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DefaultSchedules",
                columns: table => new
                {
                    ScheduleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MasjidId = table.Column<int>(type: "int", nullable: false),
                    FajrAzanTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    FajrIqamahTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    DhuhrAzanTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    DhuhrIqamahTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    AsrAzanTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    AsrIqamahTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    MaghribAzanTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    MaghribIqamahTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    IshaAzanTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    IshaIqamahTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    JummahAzanTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    JummahIqamahTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DefaultSchedules", x => x.ScheduleId);
                    table.ForeignKey(
                        name: "FK_DefaultSchedules_Masjids_MasjidId",
                        column: x => x.MasjidId,
                        principalTable: "Masjids",
                        principalColumn: "MasjidId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DefaultSchedules_MasjidId",
                table: "DefaultSchedules",
                column: "MasjidId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DefaultSchedules");
        }
    }
}
