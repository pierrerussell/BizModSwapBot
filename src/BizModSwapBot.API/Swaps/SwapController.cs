using BizModSwapBot.Domain.Swaps;
using BizModSwapBot.EfCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizModSwapBot.API.Swaps;

[ApiController]
[Route("api/[controller]")]
public class SwapController : ControllerBase
{
    private readonly AppDbContext _context;

    public SwapController(AppDbContext context)
    {
        _context = context;
        
    }
    
    [HttpGet]
    public async Task<ActionResult<ICollection<SwapRequest>>> Get()
    {
        var swapReq = await _context.SwapRequests.ToListAsync();
        if (swapReq == null)
            return NotFound();
        return swapReq;
    }
    
    
    [HttpPost]
    public async Task<IActionResult> Post(
        [FromBody] CreateSwapRequestDto swapRequest 
        )
    {
        
        try
        {
            var swapReq = new SwapRequest(
                swapRequest.telegramUserId,
                swapRequest.telegramUsername,
                swapRequest.acadYear,
                swapRequest.semester,
                swapRequest.haveModuleCode,
                swapRequest.haveClassNo,
                swapRequest.haveDetails
            );

            if (swapRequest.wantSlots != null)
            {
                foreach (var slot in swapRequest.wantSlots)
                {
                    swapReq.AddWantSlot(slot.moduleCode, slot.classNo);
                }
            }

            _context.SwapRequests.Add(swapReq);
            await _context.SaveChangesAsync();

            // Return primitive/DTO object to avoid serialization reference loops
            return Created(string.Empty, new { id = swapReq.Id, status = "Created successfully" });
        }
        catch (Exception ex)
        {
            // Catch EF Core database errors or connection issues and return readable 500 error instead of crashing IIS
            return StatusCode(500, new 
            { 
                error = "Database operation failed", 
                details = ex.InnerException?.Message ?? ex.Message 
            });
        }
    }
    
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var swapReq = _context.SwapRequests.Find(id);
        if (swapReq == null)
            return NotFound();
        _context.SwapRequests.Remove(swapReq);
        await _context.SaveChangesAsync();


        return NoContent();
    }
    
    
}

public record CreateSwapRequestDto(
    long telegramUserId,
    string telegramUsername,
    string acadYear,
    int semester,
    string haveModuleCode,
    string haveClassNo,
    string haveDetails,
    ICollection<CreateDesiredSlotDto> wantSlots
    );

public record CreateDesiredSlotDto(string moduleCode, string classNo);