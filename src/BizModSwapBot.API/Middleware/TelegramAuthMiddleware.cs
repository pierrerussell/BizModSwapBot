using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Web;

namespace BizModSwapBot.API.Middleware;

public class TelegramAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string _botToken;

    public TelegramAuthMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        _botToken = configuration["Telegram:BotToken"] ?? string.Empty;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Headers.TryGetValue("X-Telegram-Init-Data", out var initDataHeader) &&
            !string.IsNullOrWhiteSpace(initDataHeader))
        {
            var initData = initDataHeader.ToString();
            if (VerifyTelegramSignature(initData))
            {
                try
                {
                    var parsedQuery = HttpUtility.ParseQueryString(initData);
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
                    Console.WriteLine("Non telegram origin");
                }
            }
        }

        await _next(context);
    }

    private bool VerifyTelegramSignature(string initData)
    {
        if (string.IsNullOrEmpty(_botToken)) return false;

        var parsedQuery = HttpUtility.ParseQueryString(initData);
        var hash = parsedQuery["hash"];
        if (string.IsNullOrEmpty(hash)) return false;

        // Create data_check_string
        var keys = parsedQuery.AllKeys
            .Where(k => k != "hash")
            .OrderBy(k => k)
            .ToList();

        var dataCheckString = string.Join("\n", keys.Select(k => $"{k}={parsedQuery[k]}"));

        // Calculate secret_key
        using var hmacSecret = new HMACSHA256(Encoding.UTF8.GetBytes("WebAppData"));
        var secretKey = hmacSecret.ComputeHash(Encoding.UTF8.GetBytes(_botToken));

        // Calculate hash
        using var hmacHash = new HMACSHA256(secretKey);
        var computedHashBytes = hmacHash.ComputeHash(Encoding.UTF8.GetBytes(dataCheckString));
        var computedHash = BitConverter.ToString(computedHashBytes).Replace("-", "").ToLower();

        return computedHash == hash;
    }
}