using Microsoft.AspNetCore.Diagnostics;

namespace BizModSwapBot.API.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is NotImplementedException)
        {
            httpContext.Response.StatusCode = 404;
            return true;
        }

        if (exception is UnauthorizedAccessException)
        {
            httpContext.Response.StatusCode = 401;
            return true;
        }

        return false;


    }
}