using BizModSwapBot.API.Middleware;
using BizModSwapBot.EfCore;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers();
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(connectionString, b => b.EnableRetryOnFailure());
});



var app = builder.Build();

app.UseExceptionHandler();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (app.Environment.IsProduction())
{
    app.UseMiddleware<TelegramAuthMiddleware>();
}

app.MapControllers();
app.UseHttpsRedirection();

app.Run();
