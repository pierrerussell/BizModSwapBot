import type { SwapRequest } from '../types/swap';

const API_BASE_URL = 'https://swapbot.simplenotifs.com/api';

export async function submitSwapRequestToBackend(swap: SwapRequest, initData: string): Promise<void> {
    // Ready for ASP.NET POST /api/swap-request
    await fetch(`${API_BASE_URL}/swap`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Telegram-Init-Data': initData
        },
        body: JSON.stringify(swap)
    });
}

export async function getUsersSwapRequests(initData: string): Promise<SwapRequest[]> {
    const response = await fetch(`${API_BASE_URL}/swap`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Telegram-Init-Data': initData
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch swap requests: ${response.statusText}`);
    }

    return await response.json();
}