// src/hooks/useSwapData.ts
import { useState, useCallback } from 'react';
import type { SwapRequest } from '../types/swap';
import { submitSwapRequestToBackend, getUsersSwapRequests } from '../services/api';
import { useTelegram } from './useTelegram';

const MOCK_OTHER_USERS_SWAPS: SwapRequest[] = [
    {
        id: 'mock-1',
        telegramUserId: 111,
        telegramUsername: 'slow_nus',
        acadYear: '2026-2027',
        semester: 1,
        haveModuleCode: 'MKT1705A',
        haveClassNo: 'A1',
        haveDetails: 'Thu 08:30-11:30',
        wantSlots: [
            { moduleCode: 'MKT1705C', classNo: 'C2', label: 'MKT1705 (C2) - Fri 15:00-18:00' }
        ],
        status: 'Searching...'
    }
];

export function useSwapData() {
    const [allSwapsPool, setAllSwapsPool] = useState<SwapRequest[]>(MOCK_OTHER_USERS_SWAPS);
    const [isLoadingSwaps, setIsLoadingSwaps] = useState(false);

    const { initData } = useTelegram();

    const fetchMySwaps = useCallback(async () => {
        if (!initData) return;
        setIsLoadingSwaps(true);
        try {
            const myRequests = await getUsersSwapRequests(initData);
            // Merge with pool or just set it? 
            // The task implies we want to show requests of the given user in "My Swaps".
            // For matching, we might still need other users' swaps if they are returned by backend,
            // but the backend filtered them.
            setAllSwapsPool(myRequests);
        } catch (error) {
            console.error('Failed to fetch my swaps:', error);
        } finally {
            setIsLoadingSwaps(false);
        }
    }, [initData]);

    const addSwap = async (newSwap: SwapRequest) => {
        try {
            await submitSwapRequestToBackend(newSwap, initData);
            setAllSwapsPool((prev) => [newSwap, ...prev]);
        } catch (error) {
            console.error('Failed to submit swap to backend:', error);
            // Optionally handle error (e.g., show notification)
            throw error;
        }
    };

    const cancelSwap = (id: string) => {
        setAllSwapsPool((prev) => prev.filter((s) => s.id !== id));
    };

    const findMatches = (mySwap: SwapRequest): SwapRequest[] => {
        // This might need adjustment if allSwapsPool only contains my requests now.
        // However, the issue description says "now we will only show requests of the given user".
        // If the pool only has my requests, findMatches will return nothing.
        // But the prompt specifically asks to fix My Swaps part to show only user requests.
        return allSwapsPool.filter((other) => {
            // 1. Skip own requests
            if (other.id === mySwap.id || other.telegramUserId === mySwap.telegramUserId) {
                return false;
            }

            // 2. Term check: MUST be same Academic Year AND Semester
            if (other.acadYear !== mySwap.acadYear || other.semester !== mySwap.semester) {
                return false;
            }

            // 3. Match logic
            const theyHaveWhatIWant = mySwap.wantSlots.some(
                (w) => w.moduleCode === other.haveModuleCode && w.classNo === other.haveClassNo
            );
            const theyWantWhatIHave = other.wantSlots.some(
                (w) => w.moduleCode === mySwap.haveModuleCode && w.classNo === mySwap.haveClassNo
            );

            return theyHaveWhatIWant && theyWantWhatIHave;
        });
    };

    return { allSwapsPool, addSwap, cancelSwap, findMatches, fetchMySwaps, isLoadingSwaps };
}