namespace BizModSwapBot.Domain.Swaps;

public class SwapRequest
{
    public Guid Id { get; init; }
    public long TelegramUserId { get; private set; }
    public string TelegramUsername { get; private set; } = string.Empty;
    public string AcadYear { get; private set; } = string.Empty; // eg 2022-2023
    public int Semester { get; private set; }
    
    // code of the module they have eg MNO1705A
    public string HaveModuleCode { get; private set; } = string.Empty;
    // class number of the module they have eg A1 A2 etc, comes from NUSMods
    public string HaveClassNo { get; private set; } = string.Empty;
    public string HaveDetails { get; private set; } = string.Empty;
    
    public ICollection<DesiredSlot> WantSlots { get; private set; } = new List<DesiredSlot>();
    public string Status { get; set; } = string.Empty;

    public SwapRequest(
        long telegramUserId,
        string telegramUsername,
        string acadYear,
        int semester,
        string haveModuleCode,
        string haveClassNo,
        string haveDetails)
    {
        Id = Guid.NewGuid();
        TelegramUserId = telegramUserId;
        TelegramUsername = telegramUsername;
        AcadYear = acadYear;
        Semester = semester;
        HaveModuleCode = haveModuleCode;
        HaveClassNo = haveClassNo;
        HaveDetails = haveDetails;
        Status = "Pending";
        
    }
    
    public void AddWantSlot(string moduleCode, string classNo)
    {
        WantSlots.Add(new DesiredSlot
        {
            SwapRequestId = Id,
            ModuleCode = moduleCode,
            ClassNo = classNo
        });
    }
    
    public void RemoveWantSlot(string moduleCode, string classNo)
    {
        WantSlots = WantSlots.Where(slot => !(slot.ModuleCode == moduleCode && slot.ClassNo == classNo)).ToList();
        
    }
    
    public void SetStatus(string status)
    {
        Status = status;
    }
    
    
    
    
    
}
