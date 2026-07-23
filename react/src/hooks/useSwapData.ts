// src/hooks/useSwapData.ts
import { useState, useCallback } from 'react';
import type { SwapRequest } from '../types/swap';
import { submitSwapRequestToBackend, getUsersSwapRequests, deleteSwapRequest } from '../services/api';
import { useTelegram } from './useTelegram';

export function useSwapData() {
    const [allSwapsPool, setAllSwapsPool] = useState<SwapRequest[]>([]);
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

    const addSwap = async (newSwap: any) => {
        try {
            await submitSwapRequestToBackend(newSwap, initData);
            // Refresh from backend to get the real IDs and pre-calculated matches
            await fetchMySwaps();
        } catch (error) {
            console.error('Failed to submit swap to backend:', error);
            throw error;
        }
    };

    const cancelSwap = async (id: string) => {
        try {
            await deleteSwapRequest(id, initData);
            setAllSwapsPool((prev) => prev.filter((s) => s.id !== id));
        } catch (error) {
            console.error('Failed to cancel swap:', error);
        }
    };

    const findMatches = (mySwap: SwapRequest): any[] => {
        // Matches are now pre-calculated by the backend
        return mySwap.matches || [];
    };

    return { allSwapsPool, addSwap, cancelSwap, findMatches, fetchMySwaps, isLoadingSwaps };
}