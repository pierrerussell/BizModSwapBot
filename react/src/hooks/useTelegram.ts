import { useEffect, useState } from 'react';

export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
}

export function useTelegram() {
    const [user, setUser] = useState<TelegramUser | null>(null);
    const [initData, setInitData] = useState<string>('');

    useEffect(() => {
        // Access Telegram WebApp global object
        const tg = window.Telegram?.WebApp;

        if (tg) {
            tg.ready();
            tg.expand(); // Expands Mini App to full screen height

            if (tg.initDataUnsafe?.user) {
                setUser(tg.initDataUnsafe.user);
                setInitData(tg.initData); // Cryptographic raw string for backend verification
            } else {
                // MOCK DATA for local testing in desktop Google Chrome
                setUser({
                    id: 99999999,
                    first_name: 'Test',
                    username: 'test_student_nus'
                });
            }
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