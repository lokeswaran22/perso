import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns';

/**
 * Notification Service
 * Handles expiry notifications and alerts
 */

/**
 * Check for expiring items
 */
export const checkExpiringItems = (items, daysThreshold = 30) => {
    const now = new Date();
    const thresholdDate = addDays(now, daysThreshold);
    const expiringItems = [];

    items.forEach(item => {
        // Check for expiry date fields
        const expiryFields = ['expiryDate', 'validUntil', 'expiry'];

        expiryFields.forEach(field => {
            if (item[field]) {
                const expiryDate = new Date(item[field]);

                if (isAfter(expiryDate, now) && isBefore(expiryDate, thresholdDate)) {
                    expiringItems.push({
                        ...item,
                        expiryField: field,
                        expiryDate: expiryDate,
                        daysUntilExpiry: Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
                    });
                }
            }
        });
    });

    return expiringItems;
};

/**
 * Check for expired items
 */
export const checkExpiredItems = (items) => {
    const now = new Date();
    const expiredItems = [];

    items.forEach(item => {
        const expiryFields = ['expiryDate', 'validUntil', 'expiry'];

        expiryFields.forEach(field => {
            if (item[field]) {
                const expiryDate = new Date(item[field]);

                if (isBefore(expiryDate, now)) {
                    expiredItems.push({
                        ...item,
                        expiryField: field,
                        expiryDate: expiryDate,
                        daysExpired: Math.ceil((now - expiryDate) / (1000 * 60 * 60 * 24))
                    });
                }
            }
        });
    });

    return expiredItems;
};

/**
 * Format notification message
 */
export const formatExpiryNotification = (item) => {
    const daysUntil = item.daysUntilExpiry;
    const itemName = item.title || item.cardName || item.docName || item.serviceName || 'Item';

    if (daysUntil <= 7) {
        return `⚠️ ${itemName} expires in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}!`;
    } else if (daysUntil <= 30) {
        return `📅 ${itemName} expires in ${daysUntil} days`;
    } else {
        return `ℹ️ ${itemName} expires ${format(item.expiryDate, 'MMM dd, yyyy')}`;
    }
};

/**
 * Get notification priority
 */
export const getNotificationPriority = (daysUntilExpiry) => {
    if (daysUntilExpiry <= 7) return 'high';
    if (daysUntilExpiry <= 14) return 'medium';
    return 'low';
};
