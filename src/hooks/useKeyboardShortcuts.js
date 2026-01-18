import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Ignore if inside input/textarea unless it calls for it (e.g. Ctrl+Enter)
            // But usually for global shortcuts like "New Item" we might want it everywhere unless specific
            // Let's safe guard: if active element is input/textarea and no ctrl/meta key, ignore single keys.

            const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);

            // Iterate over shortcuts
            // Format: { 'ctrl+k': callback, 'esc': callback }

            Object.entries(shortcuts).forEach(([keyCombo, callback]) => {
                const keys = keyCombo.toLowerCase().split('+');
                const mainKey = keys[keys.length - 1];
                const needsCtrl = keys.includes('ctrl') || keys.includes('cmd');
                const needsShift = keys.includes('shift');
                const needsAlt = keys.includes('alt');

                const pressedCtrl = event.ctrlKey || event.metaKey;
                const pressedShift = event.shiftKey;
                const pressedAlt = event.altKey;

                if (
                    event.key.toLowerCase() === mainKey &&
                    pressedCtrl === needsCtrl &&
                    pressedShift === needsShift &&
                    pressedAlt === needsAlt
                ) {
                    // If simple key and we are in input, ignore
                    if (!pressedCtrl && !pressedAlt && isInput && mainKey.length === 1) return;

                    event.preventDefault();
                    callback();
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
};
