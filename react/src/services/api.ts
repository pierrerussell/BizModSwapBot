import type {CreateSwapRequestDto, SwapRequest} from '../types/swap';

const API_BASE_URL = 'https://swapbot.simplenotifs.com/api';

export async function submitSwapRequestToBackend(swap: CreateSwapRequestDto, initData: string): Promise<void> {
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

    const data: any[] = await response.json();
    
    // Map backend DTO to frontend SwapRequest
    return data.map(item => ({
        id: item.swapRequestId,
        telegramUserId: item.telegramUserId,
        telegramUsername: item.telegramUsername,
        acadYear: item.acadYear,
        semester: item.semester,
        haveModuleCode: item.haveModuleCode,
        haveClassNo: item.haveClassNo,
        haveDetails: item.haveDetails,
        wantSlots: item.wantSlots ? item.wantSlots.map((w: any) => ({
            moduleCode: w.moduleCode,
            classNo: w.classNo,
            label: `${w.moduleCode} (${w.classNo})`
        })) : [],
        matches: item.matches || [],
        status: 'Active'
    }));
}

export async function deleteSwapRequest(id: string, initData: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/swap/${id}`, {
        method: 'DELETE',
        headers: {
            'X-Telegram-Init-Data': initData
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to delete swap request: ${response.statusText}`);
    }
}