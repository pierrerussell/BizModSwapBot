import type { SwapRequest } from '../types/swap';

const API_BASE_URL = 'https://your-monsterasp-backend.com/api'; // Replace when backend is published

export async function submitSwapRequestToBackend(swap: SwapRequest, initData: string): Promise<void> {
    // Ready for ASP.NET POST /api/swap-request
    await fetch(`${API_BASE_URL}/swap-request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Telegram-Init-Data': initData
        },
        body: JSON.stringify(swap)
    });
}