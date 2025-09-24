using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SalahApp.Migrations
{
    /// <inheritdoc />
    public partial class FixStaticSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Admins",
                keyColumn: "AdminId",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$10$8K1p/a0dL2LkWBD/TUIxPeZz5Hl0yl9Cp8S4SqZ9oCJJlUn9k8UZG");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Admins",
                keyColumn: "AdminId",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$w05Z2qBFypLTxxz6STQhgOEAzJsdfp1ASY4BktF3bI3jJed1Yusk2");
        }
    }
}
