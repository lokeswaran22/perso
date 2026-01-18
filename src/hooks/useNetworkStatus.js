import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast.success('Back online! Syncing data...');
        };
        const handleOffline = () => {
            setIsOnline(false);
            toast.warning('You are offline. Changes saved locally.');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
};
