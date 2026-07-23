namespace BizModSwapBot.API.Middleware;


// Check user isn't spoofed
public class TelegramAuthMiddleware
{
    private readonly RequestDelegate _next;

    public TelegramAuthMiddleware(RequestDelegate next)
    {
        _next = next;
    }
    
    public async Task Invoke(HttpContext context)
    {
        string? authHeader = context.Request.Headers["X-Telegram-Init-Data"];
        
        if (authHeader == null)
            throw new UnauthorizedAccessException("No auth header");
        
        await _next(context);
    }
    
    
    
}