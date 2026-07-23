using BizModSwapBot.Domain.Swaps;
using BizModSwapBot.EfCore;
using Microsoft.AspNetCore.Mvc;

namespace BizModSwapBot.API.Swaps;

[Controller]
[Route("api/[controller]")]
public class SwapController : ControllerBase
{
    private readonly AppDbContext _context;

    public SwapController(AppDbContext context)
    {
        _context = context;
        
    }
    
    
    [HttpPost]
    public async Task<IActionResult> Post(
        [FromBody] CreateSwapRequestDto swapRequest 
        )
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

        foreach (var slot in swapRequest.wantSlots)
        {
            swapReq.AddWantSlot(slot.moduleCode, slot.classNo);
        }
        
        Console.WriteLine(swapRequest);
        _context.SwapRequests.Add(swapReq);
        await _context.SaveChangesAsync();

        return Created(string.Empty, swapReq);
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