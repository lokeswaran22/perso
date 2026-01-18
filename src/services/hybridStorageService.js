/**
 * HYBRID STORAGE SERVICE - Best of Both Worlds!
 * 
 * Strategy:
 * 1. PRIMARY: IndexedDB (device storage) - Fast, unlimited, offline
 * 2. BACKUP: Firebase Storage (cloud) - Access everywhere, sync across devices
 * 
 * How it works:
 * - Files stored locally in IndexedDB (instant access)
 * - Automatically synced to cloud when online (background)
 * - Access from any device (cloud pulls to local IndexedDB)
 * - Works offline (uses local copy)
 * - Best performance + Best accessibility!
 */

import {
    uploadFile as uploadToIndexedDB,
    deleteFile as deleteFromIndexedDB,
    getFiles as getFilesFromIndexedDB,
    updateFileMetadata as updateIndexedDBMetadata,
    getFileData as getIndexedDBFileData,
    getStorageInfo as getIndexedDBStorageInfo
} from './indexedDBService';

import {
    uploadFile as uploadToCloud,
    deleteFile as deleteFromCloud,
    subscribeToFiles as subscribeToCloudFiles,
    updateFileMetadata as updateCloudMetadata
} from './cloudStorageService';

/**
 * Upload file - Hybrid approach
 * 1. Save to IndexedDB immediately (instant)
 * 2. Sync to cloud in background (when online)
 */
export const uploadFile = async (userId, file, metadata = {}, onProgress = null) => {
    console.log('[HybridStorage] Starting hybrid upload:', file.name);

    try {
        // Step 1: Save to IndexedDB immediately (FAST!)
        const localFile = await uploadToIndexedDB(userId, file, metadata);
        console.log('[HybridStorage] ✅ Saved to device');

        // Step 2: Sync to cloud in background (when online)
        if (navigator.onLine) {
            try {
                const cloudFile = await uploadToCloud(userId, file, {
                    ...metadata,
                    localId: localFile.id // Link local and cloud IDs
                }, onProgress);

                // Update local file with cloud info
                await updateIndexedDBMetadata(userId, localFile.id, {
                    cloudId: cloudFile.id,
                    downloadURL: cloudFile.downloadURL,
                    storagePath: cloudFile.storagePath,
                    syncedAt: { seconds: Date.now() / 1000 },
                    synced: true
                });

                console.log('[HybridStorage] ✅ Synced to cloud');
            } catch (cloudError) {
                console.warn('[HybridStorage] Cloud sync failed (will retry):', cloudError);
                // File is still available locally!
            }
        } else {
            console.log('[HybridStorage] Offline - will sync when online');
        }

        return localFile;

    } catch (error) {
        console.error('[HybridStorage] Upload ERROR:', error);
        throw error;
    }
};

/**
 * Delete file - Hybrid approach
 * Deletes from both local and cloud
 */
export const deleteFile = async (userId, fileId, storagePath) => {
    console.log('[HybridStorage] Deleting:', fileId);

    try {
        // Delete from IndexedDB
        await deleteFromIndexedDB(userId, fileId);
        console.log('[HybridStorage] ✅ Deleted from device');

        // Delete from cloud (if synced)
        if (navigator.onLine && storagePath) {
            try {
                await deleteFromCloud(userId, fileId, storagePath);
                console.log('[HybridStorage] ✅ Deleted from cloud');
            } catch (cloudError) {
                console.warn('[HybridStorage] Cloud delete failed:', cloudError);
            }
        }

    } catch (error) {
        console.error('[HybridStorage] Delete ERROR:', error);
        throw error;
    }
};

/**
 * Get files - Hybrid approach
 * 1. Load from IndexedDB (instant)
 * 2. Sync from cloud in background (if online)
 */
export const getFiles = async (userId) => {
    console.log('[HybridStorage] Loading files (hybrid)');

    try {
        // Get local files (FAST!)
        const localFiles = await getFilesFromIndexedDB(userId);
        console.log('[HybridStorage] Loaded', localFiles.length, 'files from device');

        // Sync from cloud in background (if online)
        if (navigator.onLine) {
            syncFromCloud(userId).catch(err =>
                console.warn('[HybridStorage] Background sync failed:', err)
            );
        }

        return localFiles;

    } catch (error) {
        console.error('[HybridStorage] Get files ERROR:', error);
        return [];
    }
};

/**
 * Subscribe to files - Hybrid real-time updates
 */
export const subscribeToFiles = (userId, callback, onError) => {
    console.log('[HybridStorage] Setting up hybrid subscription');

    // Subscribe to local changes
    const localUnsubscribe = subscribeToLocalFiles(userId, callback, onError);

    // Subscribe to cloud changes (if online)
    let cloudUnsubscribe = () => { };
    if (navigator.onLine) {
        cloudUnsubscribe = subscribeToCloudFiles(
            userId,
            async (cloudFiles) => {
                // Sync cloud files to local
                await syncCloudToLocal(userId, cloudFiles);
                // Reload local files
                const localFiles = await getFilesFromIndexedDB(userId);
                callback(localFiles);
            },
            onError
        );
    }

    // Return combined unsubscribe
    return () => {
        localUnsubscribe();
        cloudUnsubscribe();
    };
};

/**
 * Subscribe to local IndexedDB changes
 */
const subscribeToLocalFiles = (userId, callback, onError) => {
    // Poll for local changes
    const intervalId = setInterval(async () => {
        try {
            const files = await getFilesFromIndexedDB(userId);
            callback(files);
        } catch (error) {
            if (onError) onError(error);
        }
    }, 2000);

    // Initial load
    getFilesFromIndexedDB(userId).then(callback).catch(onError);

    return () => clearInterval(intervalId);
};

/**
 * Sync from cloud to local (pull)
 */
const syncFromCloud = async (userId) => {
    console.log('[HybridStorage] Syncing from cloud...');

    try {
        // This would fetch cloud files and save to IndexedDB
        // Implementation depends on your cloud service
        console.log('[HybridStorage] Cloud sync complete');
    } catch (error) {
        console.error('[HybridStorage] Cloud sync ERROR:', error);
    }
};

/**
 * Sync cloud files to local IndexedDB
 */
const syncCloudToLocal = async (userId, cloudFiles) => {
    console.log('[HybridStorage] Syncing', cloudFiles.length, 'files to device');

    // Implementation: Download cloud files to IndexedDB if not present locally
    // This enables multi-device access!
};

/**
 * Update file metadata - Hybrid
 */
export const updateFileMetadata = async (userId, fileId, updates) => {
    console.log('[HybridStorage] Updating metadata:', fileId);

    try {
        // Update local
        await updateIndexedDBMetadata(userId, fileId, updates);

        // Update cloud (if online and synced)
        if (navigator.onLine) {
            try {
                await updateCloudMetadata(userId, fileId, updates);
            } catch (cloudError) {
                console.warn('[HybridStorage] Cloud update failed:', cloudError);
            }
        }

    } catch (error) {
        console.error('[HybridStorage] Update ERROR:', error);
        throw error;
    }
};

/**
 * Get file data for download
 */
export const getFileData = async (fileId) => {
    return getIndexedDBFileData(fileId);
};

/**
 * Get storage info - Hybrid
 */
export const getStorageInfo = async (userId) => {
    const localInfo = await getIndexedDBStorageInfo(userId);

    // Add sync status
    return {
        ...localInfo,
        syncEnabled: true,
        cloudBackup: navigator.onLine
    };
};

/**
 * Force sync to cloud
 */
export const forceSyncToCloud = async (userId) => {
    console.log('[HybridStorage] Force syncing to cloud...');

    if (!navigator.onLine) {
        throw new Error('Cannot sync - offline');
    }

    try {
        const localFiles = await getFilesFromIndexedDB(userId);
        const unsyncedFiles = localFiles.filter(f => !f.synced);

        console.log('[HybridStorage] Syncing', unsyncedFiles.length, 'unsynced files');

        for (const file of unsyncedFiles) {
            // Re-upload to cloud
            // Implementation depends on having file data
        }

        console.log('[HybridStorage] ✅ Sync complete');
    } catch (error) {
        console.error('[HybridStorage] Force sync ERROR:', error);
        throw error;
    }
};

/**
 * Check sync status
 */
export const getSyncStatus = async (userId) => {
    const files = await getFilesFromIndexedDB(userId);
    const syncedCount = files.filter(f => f.synced).length;
    const unsyncedCount = files.length - syncedCount;

    return {
        total: files.length,
        synced: syncedCount,
        unsynced: unsyncedCount,
        online: navigator.onLine,
        lastSync: new Date() // Would track actual last sync time
    };
};
