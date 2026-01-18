/**
 * INDEXEDDB STORAGE SERVICE - Unlimited Local Storage
 * Uses browser's IndexedDB to store files directly on user's device
 * Storage limit = User's available disk space (GBs, not MBs!)
 */

const DB_NAME = 'PersonalDrive';
const DB_VERSION = 1;
const STORE_NAME = 'files';

/**
 * Initialize IndexedDB
 */
const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                objectStore.createIndex('userId', 'userId', { unique: false });
                objectStore.createIndex('createdAt', 'createdAt', { unique: false });
                console.log('[IndexedDB] Object store created');
            }
        };
    });
};

/**
 * Upload file to IndexedDB
 */
export const uploadFile = async (userId, file, metadata = {}) => {
    console.log('[uploadFile] Starting upload:', file.name, 'Size:', file.size);

    try {
        const db = await initDB();

        // Read file as ArrayBuffer (more efficient than base64)
        const arrayBuffer = await file.arrayBuffer();

        // Create file object
        const fileData = {
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            name: file.name,
            size: file.size,
            type: file.type,
            data: arrayBuffer, // Store as ArrayBuffer
            category: metadata.category || getCategory(file.type),
            tags: metadata.tags || [],
            notes: metadata.notes || '',
            isFavorite: metadata.isFavorite || false,
            isOffline: metadata.isOffline || true, // Always offline!
            createdAt: { seconds: Date.now() / 1000 },
            updatedAt: { seconds: Date.now() / 1000 }
        };

        // Store in IndexedDB
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.add(fileData);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log('[uploadFile] ✅ Success! File ID:', fileData.id);

                // Return file without ArrayBuffer (for UI)
                const { data, ...fileWithoutData } = fileData;
                resolve({
                    ...fileWithoutData,
                    downloadURL: `indexeddb://${fileData.id}` // Virtual URL
                });
            };
            request.onerror = () => {
                console.error('[uploadFile] ERROR:', request.error);
                reject(request.error);
            };
        });

    } catch (error) {
        console.error('[uploadFile] ERROR:', error);
        throw error;
    }
};

/**
 * Delete file from IndexedDB
 */
export const deleteFile = async (userId, fileId) => {
    console.log('[deleteFile] Deleting:', fileId);

    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.delete(fileId);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log('[deleteFile] ✅ Deleted successfully');
                resolve();
            };
            request.onerror = () => {
                console.error('[deleteFile] ERROR:', request.error);
                reject(request.error);
            };
        });

    } catch (error) {
        console.error('[deleteFile] ERROR:', error);
        throw new Error(`Failed to delete file: ${error.message}`);
    }
};

/**
 * Get all files for a user
 */
export const getFiles = async (userId) => {
    console.log('[getFiles] Loading files for user:', userId);

    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const index = objectStore.index('userId');
        const request = index.getAll(userId);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const files = request.result.map(file => {
                    const { data, ...fileWithoutData } = file;
                    return {
                        ...fileWithoutData,
                        downloadURL: `indexeddb://${file.id}`
                    };
                });

                // Sort by creation date (newest first)
                files.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

                console.log('[getFiles] Loaded', files.length, 'files');
                resolve(files);
            };
            request.onerror = () => {
                console.error('[getFiles] ERROR:', request.error);
                reject(request.error);
            };
        });

    } catch (error) {
        console.error('[getFiles] ERROR:', error);
        return [];
    }
};

/**
 * Get file data for download
 */
export const getFileData = async (fileId) => {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.get(fileId);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                if (request.result) {
                    const file = request.result;
                    // Convert ArrayBuffer to Blob
                    const blob = new Blob([file.data], { type: file.type });
                    const url = URL.createObjectURL(blob);
                    resolve({ url, name: file.name, type: file.type });
                } else {
                    reject(new Error('File not found'));
                }
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('[getFileData] ERROR:', error);
        throw error;
    }
};

/**
 * Subscribe to files (simulated real-time)
 */
export const subscribeToFiles = (userId, callback, onError) => {
    console.log('[subscribeToFiles] Setting up subscription for user:', userId);

    // Initial load
    getFiles(userId).then(callback).catch(onError);

    // Poll for changes every 10 seconds (DISABLED to fix re-render loop)
    // const intervalId = setInterval(async () => {
    //     try {
    //         const files = await getFiles(userId);
    //         callback(files);
    //     } catch (error) {
    //         if (onError) onError(error);
    //     }
    // }, 10000); // Changed from 2000 to 10000

    // Return unsubscribe function
    return () => {
        // clearInterval(intervalId); // Disabled since polling is off
        console.log('[subscribeToFiles] Unsubscribed');
    };
};

/**
 * Update file metadata
 */
export const updateFileMetadata = async (userId, fileId, updates) => {
    console.log('[updateFileMetadata] Updating:', fileId);

    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);

        // Get existing file
        const getRequest = objectStore.get(fileId);

        return new Promise((resolve, reject) => {
            getRequest.onsuccess = () => {
                const file = getRequest.result;
                if (!file) {
                    reject(new Error('File not found'));
                    return;
                }

                // Update file
                const updatedFile = {
                    ...file,
                    ...updates,
                    updatedAt: { seconds: Date.now() / 1000 }
                };

                const putRequest = objectStore.put(updatedFile);
                putRequest.onsuccess = () => {
                    console.log('[updateFileMetadata] ✅ Success');
                    resolve();
                };
                putRequest.onerror = () => reject(putRequest.error);
            };
            getRequest.onerror = () => reject(getRequest.error);
        });

    } catch (error) {
        console.error('[updateFileMetadata] ERROR:', error);
        throw new Error(`Failed to update file: ${error.message}`);
    }
};

/**
 * Get storage usage info
 */
export const getStorageInfo = async (userId) => {
    try {
        const files = await getFiles(userId);
        const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
        const fileCount = files.length;

        // Estimate available storage (navigator.storage API)
        let storageLimit = 1024 * 1024 * 1024; // Default 1GB
        let storageUsed = totalSize;

        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            storageLimit = estimate.quota || storageLimit;
            storageUsed = estimate.usage || storageUsed;
        }

        const percentUsed = (storageUsed / storageLimit) * 100;

        return {
            fileCount,
            totalSize,
            storageUsed,
            storageLimit,
            percentUsed
        };
    } catch (error) {
        console.error('[getStorageInfo] ERROR:', error);
        return {
            fileCount: 0,
            totalSize: 0,
            storageUsed: 0,
            storageLimit: 1024 * 1024 * 1024,
            percentUsed: 0
        };
    }
};

/**
 * Helper: Get file category from MIME type
 */
const getCategory = (type) => {
    if (type.startsWith('image/')) return 'images';
    if (type.startsWith('video/')) return 'videos';
    if (type.includes('pdf') || type.includes('document') || type.includes('word') || type.includes('excel')) return 'documents';
    return 'general';
};
