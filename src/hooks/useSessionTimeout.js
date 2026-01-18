import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

export const useSessionTimeout = (timeoutMinutes = 5, onTimeout) => {
    const [lastActivity, setLastActivity] = useState(Date.now());
    const timeoutIdRef = useRef(null);
    const warningIdRef = useRef(null);

    const resetTimer = () => {
        setLastActivity(Date.now());
    };

    useEffect(() => {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        const handleActivity = () => {
            resetTimer();
        };

        events.forEach(event => {
            document.addEventListener(event, handleActivity);
        });

        // Loop to check timeout
        timeoutIdRef.current = setInterval(() => {
            const now = Date.now();
            const elapsed = now - lastActivity;
            const limit = timeoutMinutes * 60 * 1000;

            if (elapsed > limit) {
                if (onTimeout) onTimeout();
                resetTimer(); // Reset after calling timeout to prevent loop
            }
        }, 10000); // Check every 10 seconds

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
            if (timeoutIdRef.current) clearInterval(timeoutIdRef.current);
            if (warningIdRef.current) clearTimeout(warningIdRef.current);
        };
    }, [timeoutMinutes, lastActivity, onTimeout]);

    return lastActivity;
};
