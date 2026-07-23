using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;


namespace BizModSwapBot.EfCore;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        string configPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "BizModSwapBot.Api");
        IConfigurationRoot config = new ConfigurationBuilder()
            .SetBasePath(configPath)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();
        
         
        
        var connectionString = config.GetConnectionString("DefaultConnection");
        Console.WriteLine(connectionString);
        var options = new DbContextOptionsBuilder<AppDbContext>();
        options.UseSqlServer(connectionString);
        return new AppDbContext(options.Options);
        
    }
}