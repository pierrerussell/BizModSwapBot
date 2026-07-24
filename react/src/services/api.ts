import type {CreateSwapRequestDto, SwapRequest} from '../types/swap';

const API_BASE_URL = 'https://swapbot.simplenotifs.com/api';

async function handleResponse(response: Response, defaultError: string): Promise<any> {
    if (!response.ok) {
        let errorMessage = defaultError;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || defaultError;
        } catch {
            // If response is not JSON, use status text
            errorMessage = `${defaultError}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }
    if (response.status === 204) return null;
    return response.json();
}

export async function submitSwapRequestToBackend(swap: CreateSwapRequestDto, initData: string): Promise<void> {
    // Ready for ASP.NET POST /api/swap-request
    const response = await fetch(`${API_BASE_URL}/swap`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Telegram-Init-Data': initData
        },
        body: JSON.stringify(swap)
    });

    await handleResponse(response, 'Failed to submit swap request');
}

export async function getUsersSwapRequests(initData: string): Promise<SwapRequest[]> {
    const response = await fetch(`${API_BASE_URL}/swap`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Telegram-Init-Data': initData
        }
    });

    const data: any[] = await handleResponse(response, 'Failed to fetch swap requests');
    
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
        status: item.status || 'Active'
    }));
}

export async function deleteSwapRequest(id: string, initData: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/swap/${id}`, {
        method: 'DELETE',
        headers: {
            'X-Telegram-Init-Data': initData
        }
    });

    await handleResponse(response, 'Failed to delete swap request');
}

export async function closeSwapRequest(id: string, initData: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/swap/${id}/close`, {
        method: 'POST',
        headers: {
            'X-Telegram-Init-Data': initData
        }
    });

    await handleResponse(response, 'Failed to close swap request');
}