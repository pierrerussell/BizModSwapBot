using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizModSwapBot.EfCore.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SwapRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TelegramUserId = table.Column<long>(type: "bigint", nullable: false),
                    TelegramUsername = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AcadYear = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Semester = table.Column<int>(type: "int", nullable: false),
                    HaveModuleCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HaveClassNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HaveDetails = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SwapRequests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DesiredSlots",
                columns: table => new
                {
                    SwapRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ModuleCode = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClassNo = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DesiredSlots", x => new { x.SwapRequestId, x.ModuleCode, x.ClassNo });
                    table.ForeignKey(
                        name: "FK_DesiredSlots_SwapRequests_SwapRequestId",
                        column: x => x.SwapRequestId,
                        principalTable: "SwapRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DesiredSlots");

            migrationBuilder.DropTable(
                name: "SwapRequests");
        }
    }
}
