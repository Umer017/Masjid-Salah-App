using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SalahApp.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Admins",
                columns: table => new
                {
                    AdminId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Admin")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Admins", x => x.AdminId);
                });

            migrationBuilder.CreateTable(
                name: "States",
                columns: table => new
                {
                    StateId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StateName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AdminId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_States", x => x.StateId);
                    table.ForeignKey(
                        name: "FK_States_Admins_AdminId",
                        column: x => x.AdminId,
                        principalTable: "Admins",
                        principalColumn: "AdminId");
                });

            migrationBuilder.CreateTable(
                name: "Cities",
                columns: table => new
                {
                    CityId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CityName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StateId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cities", x => x.CityId);
                    table.ForeignKey(
                        name: "FK_Cities_States_StateId",
                        column: x => x.StateId,
                        principalTable: "States",
                        principalColumn: "StateId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Masjids",
                columns: table => new
                {
                    MasjidId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MasjidName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CityId = table.Column<int>(type: "int", nullable: false),
                    Latitude = table.Column<decimal>(type: "decimal(10,8)", precision: 10, scale: 8, nullable: true),
                    Longitude = table.Column<decimal>(type: "decimal(11,8)", precision: 11, scale: 8, nullable: true),
                    ContactNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ImamName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Masjids", x => x.MasjidId);
                    table.ForeignKey(
                        name: "FK_Masjids_Cities_CityId",
                        column: x => x.CityId,
                        principalTable: "Cities",
                        principalColumn: "CityId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DailyAdditionalTimings",
                columns: table => new
                {
                    AdditionalId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MasjidId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    SunriseTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    SunsetTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    ZawalTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    TahajjudTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    SehriEndTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    IftarTime = table.Column<TimeOnly>(type: "time", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyAdditionalTimings", x => x.AdditionalId);
                    table.ForeignKey(
                        name: "FK_DailyAdditionalTimings_Masjids_MasjidId",
                        column: x => x.MasjidId,
                        principalTable: "Masjids",
                        principalColumn: "MasjidId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SalahTimings",
                columns: table => new
                {
                    SalahId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MasjidId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    IslamicDate = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
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
                    JummahIqamahTime = table.Column<TimeOnly>(type: "time", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalahTimings", x => x.SalahId);
                    table.ForeignKey(
                        name: "FK_SalahTimings_Masjids_MasjidId",
                        column: x => x.MasjidId,
                        principalTable: "Masjids",
                        principalColumn: "MasjidId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SpecialEvents",
                columns: table => new
                {
                    EventId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MasjidId = table.Column<int>(type: "int", nullable: false),
                    EventName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EventDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EventTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpecialEvents", x => x.EventId);
                    table.ForeignKey(
                        name: "FK_SpecialEvents_Masjids_MasjidId",
                        column: x => x.MasjidId,
                        principalTable: "Masjids",
                        principalColumn: "MasjidId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Admins",
                columns: new[] { "AdminId", "Email", "PasswordHash", "Role", "Username" },
                values: new object[] { 1, "admin@salahapp.com", "$2a$11$w05Z2qBFypLTxxz6STQhgOEAzJsdfp1ASY4BktF3bI3jJed1Yusk2", "SuperAdmin", "admin" });

            migrationBuilder.InsertData(
                table: "States",
                columns: new[] { "StateId", "AdminId", "StateName" },
                values: new object[,]
                {
                    { 1, null, "Andhra Pradesh" },
                    { 2, null, "Telangana" },
                    { 3, null, "Karnataka" },
                    { 4, null, "Tamil Nadu" },
                    { 5, null, "Kerala" },
                    { 6, null, "Maharashtra" },
                    { 7, null, "Gujarat" },
                    { 8, null, "Rajasthan" },
                    { 9, null, "Uttar Pradesh" },
                    { 10, null, "Bihar" },
                    { 11, null, "West Bengal" },
                    { 12, null, "Odisha" },
                    { 13, null, "Madhya Pradesh" },
                    { 14, null, "Delhi" },
                    { 15, null, "Punjab" },
                    { 16, null, "Haryana" },
                    { 17, null, "Himachal Pradesh" },
                    { 18, null, "Uttarakhand" },
                    { 19, null, "Jammu and Kashmir" },
                    { 20, null, "Assam" }
                });

            migrationBuilder.InsertData(
                table: "Cities",
                columns: new[] { "CityId", "CityName", "StateId" },
                values: new object[,]
                {
                    { 1, "Hyderabad", 1 },
                    { 2, "Visakhapatnam", 1 },
                    { 3, "Vijayawada", 1 },
                    { 4, "Warangal", 2 },
                    { 5, "Nizamabad", 2 },
                    { 6, "Bangalore", 3 },
                    { 7, "Mysore", 3 },
                    { 8, "Mangalore", 3 },
                    { 9, "Chennai", 4 },
                    { 10, "Coimbatore", 4 },
                    { 11, "Madurai", 4 },
                    { 12, "Kochi", 5 },
                    { 13, "Thiruvananthapuram", 5 },
                    { 14, "Kozhikode", 5 },
                    { 15, "Mumbai", 6 },
                    { 16, "Pune", 6 },
                    { 17, "Nagpur", 6 },
                    { 18, "New Delhi", 14 },
                    { 19, "Lucknow", 9 },
                    { 20, "Kanpur", 9 },
                    { 21, "Agra", 9 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Admins_Email",
                table: "Admins",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Admins_Username",
                table: "Admins",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cities_CityName_StateId",
                table: "Cities",
                columns: new[] { "CityName", "StateId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cities_StateId",
                table: "Cities",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyAdditionalTimings_MasjidId_Date",
                table: "DailyAdditionalTimings",
                columns: new[] { "MasjidId", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Masjids_CityId",
                table: "Masjids",
                column: "CityId");

            migrationBuilder.CreateIndex(
                name: "IX_Masjids_MasjidName_CityId",
                table: "Masjids",
                columns: new[] { "MasjidName", "CityId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalahTimings_MasjidId_Date",
                table: "SalahTimings",
                columns: new[] { "MasjidId", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SpecialEvents_MasjidId",
                table: "SpecialEvents",
                column: "MasjidId");

            migrationBuilder.CreateIndex(
                name: "IX_States_AdminId",
                table: "States",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_States_StateName",
                table: "States",
                column: "StateName",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DailyAdditionalTimings");

            migrationBuilder.DropTable(
                name: "SalahTimings");

            migrationBuilder.DropTable(
                name: "SpecialEvents");

            migrationBuilder.DropTable(
                name: "Masjids");

            migrationBuilder.DropTable(
                name: "Cities");

            migrationBuilder.DropTable(
                name: "States");

            migrationBuilder.DropTable(
                name: "Admins");
        }
    }
}
