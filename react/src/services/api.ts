import type { SwapRequest } from '../types/swap';

const API_BASE_URL = 'https://nusbizmodswapbot.runasp.net/api';

export async function submitSwapRequestToBackend(swap: SwapRequest, initData: string): Promise<void> {
    // Ready for ASP.NET POST /api/swap-request
    console.log('Submitting swap request to backend:', swap);
    await fetch(`${API_BASE_URL}/swap`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Telegram-Init-Data': initData
        },
        body: JSON.stringify(swap)
    });
}