// src/hooks/useSwapData.ts
import { useState } from 'react';
import type { SwapRequest } from '../types/swap';

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
            { moduleCode: 'MKT1705', classNo: 'C2', label: 'MKT1705 (C2) - Fri 15:00-18:00' }
        ],
        status: 'Searching...'
    }
];

export function useSwapData() {
    const [allSwapsPool, setAllSwapsPool] = useState<SwapRequest[]>(MOCK_OTHER_USERS_SWAPS);

    const addSwap = (newSwap: SwapRequest) => {
        setAllSwapsPool((prev) => [newSwap, ...prev]);
    };

    const cancelSwap = (id: string) => {
        setAllSwapsPool((prev) => prev.filter((s) => s.id !== id));
    };

    const findMatches = (mySwap: SwapRequest): SwapRequest[] => {
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

    return { allSwapsPool, addSwap, cancelSwap, findMatches };
}