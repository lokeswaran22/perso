import { collection, addDoc, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Audit Logging Service
 * Tracks all user actions for security and compliance
 */

export const AUDIT_ACTIONS = {
    LOGIN: 'login',
    LOGOUT: 'logout',
    CREATE_ITEM: 'create_item',
    UPDATE_ITEM: 'update_item',
    DELETE_ITEM: 'delete_item',
    VIEW_ITEM: 'view_item',
    EXPORT_DATA: 'export_data',
    IMPORT_DATA: 'import_data',
    CHANGE_PASSWORD: 'change_password',
    ENABLE_2FA: 'enable_2fa',
    DISABLE_2FA: 'disable_2fa'
};

/**
 * Log an audit event
 */
export const logAuditEvent = async (userId, action, details = {}) => {
    try {
        const auditCollection = collection(db, 'users', userId, 'auditLog');

        await addDoc(auditCollection, {
            action,
            details,
            timestamp: new Date(),
            userAgent: navigator.userAgent,
            ip: 'client-side' // In production, get from server
        });
    } catch (error) {
        console.error('Audit log error:', error);
        // Don't throw - audit logging shouldn't break functionality
    }
};

/**
 * Get audit logs for a user
 */
export const getAuditLogs = async (userId, limitCount = 50) => {
    try {
        const auditCollection = collection(db, 'users', userId, 'auditLog');
        const q = query(auditCollection, orderBy('timestamp', 'desc'), limit(limitCount));

        const querySnapshot = await getDocs(q);
        const logs = [];

        querySnapshot.forEach((doc) => {
            logs.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return logs;
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return [];
    }
};

/**
 * Get audit logs by action type
 */
export const getAuditLogsByAction = async (userId, action, limitCount = 20) => {
    try {
        const auditCollection = collection(db, 'users', userId, 'auditLog');
        const q = query(
            auditCollection,
            where('action', '==', action),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const logs = [];

        querySnapshot.forEach((doc) => {
            logs.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return logs;
    } catch (error) {
        console.error('Error fetching audit logs by action:', error);
        return [];
    }
};
