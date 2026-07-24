// src/hooks/useSwapData.ts
import { useState, useCallback } from 'react';
import type { SwapRequest } from '../types/swap';
import { submitSwapRequestToBackend, getUsersSwapRequests, deleteSwapRequest, closeSwapRequest } from '../services/api';
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
            setAllSwapsPool(myRequests);
        } catch (error) {
            console.error('Failed to fetch my swaps:', error);
            throw error;
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
            throw error;
        }
    };

    const closeSwap = async (id: string) => {
        try {
            await closeSwapRequest(id, initData);
            setAllSwapsPool((prev) => prev.filter((s) => s.id !== id));
        } catch (error) {
            console.error('Failed to close swap:', error);
            throw error;
        }
    };

    const findMatches = (mySwap: SwapRequest): any[] => {
        // Matches are now pre-calculated by the backend
        return mySwap.matches || [];
    };

    return { allSwapsPool, addSwap, cancelSwap, closeSwap, findMatches, fetchMySwaps, isLoadingSwaps };
}