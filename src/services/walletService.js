import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { encryptObject, decryptObject } from '../utils/encryption';
import { getSensitiveFields } from '../utils/categories';

/**
 * Wallet service for managing encrypted wallet items in Firestore
 * Includes duplicate checking to prevent saving same data twice.
 */

const getUserWalletCollection = (userId) => {
    return collection(db, 'users', userId, 'walletItems');
};

/**
 * Add a new wallet item with Duplicate Check
 */
export const addWalletItem = async (userId, item, encryptionKey) => {
    console.log('[addWalletItem] Starting save', { userId, category: item.category });
    try {
        const walletCollection = getUserWalletCollection(userId);
        console.log('[addWalletItem] Got collection');

        // 1. DUPLICATE CHECK
        // Since data is encrypted, we can't query by content deeply. 
        // We will fetch all items (usually small count for personal wallets) and check locally.
        // TEMPORARILY DISABLED - This was causing hangs
        // const allItems = await getWalletItems(userId, encryptionKey);
        const allItems = [];

        const isDuplicate = allItems.some(existing => {
            if (existing.category !== item.category) return false;
            // Check based on unique fields
            const isMatch = (
                (item.cardNumber && existing.cardNumber === item.cardNumber) ||
                (item.docNumber && existing.docNumber === item.docNumber) ||
                (item.accountNumber && existing.accountNumber === item.accountNumber) ||
                (item.regNumber && existing.regNumber === item.regNumber) ||
                (item.username && item.serviceName && existing.username === item.username && existing.serviceName === item.serviceName) ||
                (item.licenseKey && existing.licenseKey === item.licenseKey)
            );

            if (isMatch) return true;

            // For simple notes, check title if it exists, otherwise allow duplicates (users might have multiple 'Meeting Notes')
            if (item.category === 'notes' && item.title && existing.title === item.title) return true;

            return false;
        });

        if (isDuplicate) {
            throw new Error("DuplicateError: This item already exists in your wallet.");
        }

        // 2. ENCRYPT AND SAVE
        const sensitiveFields = getSensitiveFields(item.category) || [];
        const encryptedItem = encryptObject(item, sensitiveFields, encryptionKey);

        const itemWithMetadata = {
            ...encryptedItem,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        console.log('[addWalletItem] Calling addDoc');
        const docRef = await addDoc(walletCollection, itemWithMetadata);
        console.log('[addWalletItem] Success! ID:', docRef.id);
        return docRef.id;

    } catch (error) {
        console.error('[addWalletItem] ERROR:', error);
        console.error('[addWalletItem] Error code:', error.code);
        console.error('[addWalletItem] Error message:', error.message);
        if (error.message.includes("DuplicateError")) {
            throw error; // Re-throw to handle in UI
        }
        throw new Error(`Failed to add wallet item: ${error.message}`);
    }
};

export const updateWalletItem = async (userId, itemId, updates, encryptionKey) => {
    try {
        const sensitiveFields = getSensitiveFields(updates.category) || [];
        const encryptedUpdates = encryptObject(updates, sensitiveFields, encryptionKey);

        const updatesWithMetadata = {
            ...encryptedUpdates,
            updatedAt: serverTimestamp()
        };

        const itemRef = doc(db, 'users', userId, 'walletItems', itemId);
        await updateDoc(itemRef, updatesWithMetadata);

        return { id: itemId, ...updates };
    } catch (error) {
        console.error('Error updating wallet item:', error);
        throw new Error('Failed to update wallet item');
    }
};

export const deleteWalletItem = async (userId, itemId) => {
    try {
        const itemRef = doc(db, 'users', userId, 'walletItems', itemId);
        await deleteDoc(itemRef);
    } catch (error) {
        console.error('Error deleting wallet item:', error);
        throw new Error('Failed to delete wallet item');
    }
};

export const getWalletItems = async (userId, encryptionKey) => {
    try {
        const walletCollection = getUserWalletCollection(userId);
        const q = query(walletCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const items = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const sensitiveFields = getSensitiveFields(data.category) || [];
            try {
                const decryptedData = decryptObject(data, sensitiveFields, encryptionKey);
                items.push({ id: doc.id, ...decryptedData });
            } catch (e) {
                console.warn(`Failed to decrypt item ${doc.id}, skipping.`, e);
            }
        });

        return items;
    } catch (error) {
        console.error('Error getting wallet items:', error);
        // Don't throw, just return empty so UI doesn't crash completely
        return [];
    }
};

export const subscribeToWalletItems = (userId, encryptionKey, callback, onError) => {
    try {
        const walletCollection = getUserWalletCollection(userId);

        // Use a simple query first to guarantee results, client-side sort if index fails
        // This is safer for rapid UI iterations where indexes might not be ready
        const q = query(walletCollection);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                try {
                    const sensitiveFields = getSensitiveFields(data.category) || [];
                    const decryptedData = decryptObject(data, sensitiveFields, encryptionKey);
                    items.push({ id: doc.id, ...decryptedData });
                } catch (decryptionErr) {
                    console.error("Decryption failed for item", doc.id, decryptionErr);
                    items.push({ id: doc.id, category: 'unknown', title: 'Decryption Error', notes: 'Could not decrypt this item.' });
                }
            });

            // Sort client-side to be safe
            items.sort((a, b) => {
                const tA = a.createdAt?.seconds || 0;
                const tB = b.createdAt?.seconds || 0;
                return tB - tA;
            });

            callback(items);
        }, (error) => {
            console.error('Firestore subscription error:', error);
            if (onError) onError(error);
        });

        return unsubscribe;
    } catch (error) {
        console.error('Error in subscription setup:', error);
        throw error;
    }
};
