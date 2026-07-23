using System.Text.Json;
using System.Web;

namespace BizModSwapBot.API.Middleware;

public class TelegramAuthMiddleware
{
    private readonly RequestDelegate _next;

    public TelegramAuthMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Check for the header
        if (context.Request.Headers.TryGetValue("X-Telegram-Init-Data", out var initDataHeader) &&
            !string.IsNullOrWhiteSpace(initDataHeader))
        {
            try
            {
                var parsedQuery = HttpUtility.ParseQueryString(initDataHeader.ToString());
                var userJson = parsedQuery["user"];

                if (!string.IsNullOrEmpty(userJson))
                {
                    using var doc = JsonDocument.Parse(userJson);
                    if (doc.RootElement.TryGetProperty("id", out var idElement))
                    {
                        // Store the extracted ID in HttpContext.Items for down-stream access
                        context.Items["TelegramUserId"] = idElement.GetInt64();
                    }
                }
            }
            catch
            {
                // Optionally log parsing failures here
            }
        }

        await _next(context);
    }
}