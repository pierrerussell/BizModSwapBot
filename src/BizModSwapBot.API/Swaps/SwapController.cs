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
    public async Task<ActionResult<ICollection<SwapRequestWithMatchesDto>>> Get()
    {
        var telegramUserId = HttpContext.Items["TelegramUserId"] as long?;
        if (telegramUserId == null)
        {
            return Unauthorized();
        }

        var result = await _context.SwapRequests
            .Where(mySwap => mySwap.TelegramUserId == telegramUserId)
            .Select(mySwap => new SwapRequestWithMatchesDto(
                mySwap.Id,
                mySwap.TelegramUserId,
                mySwap.TelegramUsername,
                mySwap.AcadYear,
                mySwap.Semester,
                mySwap.HaveModuleCode,
                mySwap.HaveClassNo,
                mySwap.HaveDetails,
                mySwap.WantSlots,

                // Single DB query evaluates all matches in SQL
                _context.SwapRequests
                    .Where(other =>
                        // 1. Not the current user
                        other.TelegramUserId != mySwap.TelegramUserId &&
                        // 2. Same Academic Term
                        other.AcadYear == mySwap.AcadYear &&
                        other.Semester == mySwap.Semester &&
                        // 3. Other user HAS a slot that I WANT
                        mySwap.WantSlots.Any(w => w.ModuleCode == other.HaveModuleCode && w.ClassNo == other.HaveClassNo) &&
                        // 4. Other user WANTS the slot that I HAVE
                        other.WantSlots.Any(w => w.ModuleCode == mySwap.HaveModuleCode && w.ClassNo == mySwap.HaveClassNo)
                    )
                    .Select(other => new SwapRequestMatchDto(
                        other.Id,
                        other.HaveModuleCode,
                        other.HaveClassNo,
                        other.TelegramUserId.ToString(),
                        other.TelegramUsername
                    ))
                    .ToList()
            ))
            .ToListAsync();

        return Ok(result);
    }
    
    [HttpPost]
    public async Task<IActionResult> Post(
        [FromBody] CreateSwapRequestDto swapRequest 
        )
    {
        var telegramUserId = HttpContext.Items["TelegramUserId"] as long?;
        if (telegramUserId == null)
        {
            return Unauthorized();
        }
        bool exists = await _context.SwapRequests.AnyAsync(s =>
            s.TelegramUserId == telegramUserId &&
            s.HaveModuleCode == swapRequest.haveModuleCode &&
            s.HaveClassNo == swapRequest.haveClassNo &&
            s.AcadYear == swapRequest.acadYear &&
            s.Semester == swapRequest.semester);

        if (exists)
        {
            return Conflict(new { 
                message = "You have already submitted a swap request for this class slot." 
            });
        }
        
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
        var telegramUserId = HttpContext.Items["TelegramUserId"] as long?;
        if (telegramUserId == null)
        {
            return Unauthorized();
        }

        var swapReq = await _context.SwapRequests.FirstOrDefaultAsync(x => x.Id == id && x.TelegramUserId == telegramUserId );
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

public record SwapRequestWithMatchesDto(
    Guid swapRequestId,
    long telegramUserId,
    string telegramUsername,
    string acadYear,
    int semester,
    string haveModuleCode,
    string haveClassNo,
    string haveDetails,
    ICollection<DesiredSlot> wantSlots,
    ICollection<SwapRequestMatchDto> matches
    );
    
public record SwapRequestMatchDto(
    Guid swapRequestId,
    string moduleCode,
    string classNo,
    string telegramUserId,
    string telegramUsername
    );