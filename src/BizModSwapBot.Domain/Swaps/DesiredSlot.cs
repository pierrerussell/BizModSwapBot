namespace BizModSwapBot.Domain.Swaps;

public class DesiredSlot
{
    public Guid SwapRequestId { get; set; }
    
    public string ModuleCode { get; set; } = string.Empty;
    public string ClassNo { get; set; } = string.Empty;
}