import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
    const [installPrompt, setInstallPrompt] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const installApp = async () => {
        if (!installPrompt) return;

        installPrompt.prompt();

        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
        } else {
            console.log('User dismissed the A2HS prompt');
        }

        setInstallPrompt(null);
    };

    return { installPrompt, installApp };
};
