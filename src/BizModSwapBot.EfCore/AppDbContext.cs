using BizModSwapBot.Domain.Swaps;
using Microsoft.EntityFrameworkCore;

namespace BizModSwapBot.EfCore;

public class AppDbContext : DbContext
{
    public DbSet<SwapRequest> SwapRequests { get; set; } 

    
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
        
    }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SwapRequest>(b =>
        {
            b.ToTable("SwapRequests");
            b.HasKey(x => x.Id);
            b.HasMany(x => x.WantSlots)
                .WithOne()
                .HasForeignKey(x => x.SwapRequestId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        
        
        modelBuilder.Entity<DesiredSlot>(b =>
        {
            b.ToTable("DesiredSlots");
            b.HasKey(x => new { x.SwapRequestId, x.ModuleCode, x.ClassNo });
        });
    }
    
}