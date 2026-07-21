import { useEffect, useState } from 'react';

export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
}

export function useTelegram() {
    const [user] = useState<TelegramUser | null>(() => {
        const tg = window.Telegram?.WebApp;
        if (tg) {
            if (tg.initDataUnsafe?.user) {
                return tg.initDataUnsafe.user;
            }
            // MOCK DATA for local testing in desktop Google Chrome
            return {
                id: 99999999,
                first_name: 'Test',
                username: 'test_student_nus'
            };
        }
        return null;
    });

    const [initData] = useState<string>(() => {
        return window.Telegram?.WebApp?.initData || '';
    });

    useEffect(() => {
        // Access Telegram WebApp global object
        const tg = window.Telegram?.WebApp;

        if (tg) {
            tg.ready();
            tg.expand(); // Expands Mini App to full screen height
        } else {
            // Even if tg is not found (e.g. running in plain browser without script), 
            // we might want a fallback for dev, but for now we keep it null to show Guest
            console.warn('Telegram WebApp script not loaded');
        }
    }, []);

    return {
        user,
        initData,
        tg: window.Telegram?.WebApp
    };
}