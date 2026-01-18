import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    addWalletItem,
    updateWalletItem,
    deleteWalletItem,
    subscribeToWalletItems
} from '../services/walletService';
import { logAuditEvent, AUDIT_ACTIONS } from '../services/auditService';
import { filterByTag, filterFavorites } from '../utils/enhancedCategories';
import { toast } from 'react-toastify';

export const useWalletData = (user, encryptionKey) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({
        search: '',
        category: null,
        tag: null,
        onlyFavorites: false
    });

    // Subscribe to data
    useEffect(() => {
        if (!user || !encryptionKey) {
            setItems([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = subscribeToWalletItems(
            user.uid,
            encryptionKey,
            (data) => {
                setItems(data);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Wallet subscription error:", err);
                // Handle permission-denied specifically to avoid noise
                if (err.code === 'permission-denied') {
                    toast.error("Access denied. Please check your login.");
                } else {
                    toast.error("Sync issue: checking connection...");
                }
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, encryptionKey]);

    // CRUD Operations
    const addItem = useCallback(async (itemData) => {
        try {
            const id = await addWalletItem(user.uid, itemData, encryptionKey);
            logAuditEvent(user.uid, AUDIT_ACTIONS.CREATE_ITEM, { itemId: id });
            toast.success('Item saved securely');
            return id;
        } catch (err) {
            console.error(err);
            if (err.message.includes("DuplicateError")) {
                toast.warning("This item already exists in your wallet.");
            } else {
                toast.error('Failed to save item. Please try again.');
            }
            throw err;
        }
    }, [user, encryptionKey]);

    const updateItem = useCallback(async (id, itemData) => {
        try {
            await updateWalletItem(user.uid, id, itemData, encryptionKey);
            logAuditEvent(user.uid, AUDIT_ACTIONS.UPDATE_ITEM, { itemId: id });
            toast.success('Item updated successfully');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update item');
            throw err;
        }
    }, [user, encryptionKey]);

    const deleteItem = useCallback(async (id) => {
        if (window.confirm("Are you sure you want to delete this item? This cannot be undone.")) {
            try {
                await deleteWalletItem(user.uid, id);
                logAuditEvent(user.uid, AUDIT_ACTIONS.DELETE_ITEM, { itemId: id });
                toast.info('Item deleted');
            } catch (err) {
                console.error(err);
                toast.error('Failed to delete item');
                throw err;
            }
        }
    }, [user]);

    // Derived State (Filtering)
    const filteredItems = useMemo(() => {
        let result = items;

        if (filter.category) {
            result = result.filter(item => item.category === filter.category);
        }

        if (filter.tag) {
            result = filterByTag(result, filter.filter);
        }

        if (filter.onlyFavorites) {
            result = filterFavorites(result);
        }

        if (filter.search) {
            const query = filter.search.toLowerCase();
            result = result.filter(item => {
                const searchStr = JSON.stringify(Object.values(item)).toLowerCase();
                return searchStr.includes(query);
            });
        }

        return result;
    }, [items, filter]);

    const stats = useMemo(() => {
        const total = items.length;
        const favorites = items.filter(i => i.isFavorite).length;
        const byCategory = items.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {});

        return { total, favorites, byCategory };
    }, [items]);

    return {
        items,
        filteredItems,
        loading,
        error,
        stats,
        filter,
        setFilter,
        addItem,
        updateItem,
        deleteItem
    };
};
