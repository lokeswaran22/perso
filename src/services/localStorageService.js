/**
 * LOCAL STORAGE SERVICE - 100% Offline, Zero Configuration
 * Stores files directly in browser localStorage
 * No Firebase, no CORS, no configuration needed!
 */

const STORAGE_KEY = 'drive_files';

/**
 * Get all files from localStorage
 */
const getStoredFiles = (userId) => {
    try {
        const key = `${STORAGE_KEY}_${userId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('[localStorage] Error reading files:', error);
        return [];
    }
};

/**
 * Save files to localStorage
 */
const saveFiles = (userId, files) => {
    try {
        const key = `${STORAGE_KEY}_${userId}`;
        localStorage.setItem(key, JSON.stringify(files));
        return true;
    } catch (error) {
        console.error('[localStorage] Error saving files:', error);
        // Check if quota exceeded
        if (error.name === 'QuotaExceededError') {
            throw new Error('Storage quota exceeded. Please delete some files.');
        }
        throw error;
    }
};

/**
 * Convert file to base64
 */
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Upload a file - stores as base64 in localStorage
 */
export const uploadFile = async (userId, file, metadata = {}) => {
    console.log('[uploadFile] Starting upload:', file.name, 'Size:', file.size);

    try {
        // Check file size (localStorage has ~5-10MB limit per domain)
        const maxSize = 2 * 1024 * 1024; // 2MB to be safe
        if (file.size > maxSize) {
            throw new Error(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB. Your file is ${Math.round(file.size / 1024 / 1024)}MB.`);
        }

        // Convert to base64
        console.log('[uploadFile] Converting to base64...');
        const base64Data = await fileToBase64(file);
        console.log('[uploadFile] Conversion complete');

        // Get existing files
        const files = getStoredFiles(userId);

        // Create new file object
        const newFile = {
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            data: base64Data,
            category: metadata.category || 'general',
            tags: metadata.tags || [],
            notes: metadata.notes || '',
            isFavorite: metadata.isFavorite || false,
            createdAt: { seconds: Date.now() / 1000 },
            updatedAt: { seconds: Date.now() / 1000 }
        };

        // Add to files array
        files.push(newFile);

        // Save to localStorage
        console.log('[uploadFile] Saving to localStorage...');
        saveFiles(userId, files);
        console.log('[uploadFile] ✅ Success! File ID:', newFile.id);

        return newFile;

    } catch (error) {
        console.error('[uploadFile] ERROR:', error);
        throw error;
    }
};

/**
 * Delete a file
 */
export const deleteFile = async (userId, fileId) => {
    console.log('[deleteFile] Deleting:', fileId);

    try {
        const files = getStoredFiles(userId);
        const updatedFiles = files.filter(f => f.id !== fileId);
        saveFiles(userId, updatedFiles);
        console.log('[deleteFile] ✅ Deleted successfully');

    } catch (error) {
        console.error('[deleteFile] ERROR:', error);
        throw new Error(`Failed to delete file: ${error.message}`);
    }
};

/**
 * Get all files for a user
 */
export const getFiles = (userId) => {
    console.log('[getFiles] Loading files for user:', userId);
    const files = getStoredFiles(userId);

    // Sort by creation date (newest first)
    files.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
    });

    console.log('[getFiles] Loaded', files.length, 'files');
    return files;
};

/**
 * Subscribe to files (simulated real-time updates)
 * Returns an unsubscribe function
 */
export const subscribeToFiles = (userId, callback, onError) => {
    console.log('[subscribeToFiles] Setting up subscription for user:', userId);

    try {
        // Initial load
        const files = getFiles(userId);
        callback(files);

        // Listen for storage events (updates from other tabs)
        const handleStorageChange = (e) => {
            if (e.key === `${STORAGE_KEY}_${userId}`) {
                console.log('[subscribeToFiles] Storage changed, reloading files');
                const updatedFiles = getFiles(userId);
                callback(updatedFiles);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Return unsubscribe function
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            console.log('[subscribeToFiles] Unsubscribed');
        };

    } catch (error) {
        console.error('[subscribeToFiles] Setup ERROR:', error);
        if (onError) onError(error);
        return () => { }; // Return empty unsubscribe
    }
};

/**
 * Update file metadata
 */
export const updateFileMetadata = async (userId, fileId, updates) => {
    console.log('[updateFileMetadata] Updating:', fileId);

    try {
        const files = getStoredFiles(userId);
        const fileIndex = files.findIndex(f => f.id === fileId);

        if (fileIndex === -1) {
            throw new Error('File not found');
        }

        files[fileIndex] = {
            ...files[fileIndex],
            ...updates,
            updatedAt: { seconds: Date.now() / 1000 }
        };

        saveFiles(userId, files);
        console.log('[updateFileMetadata] ✅ Success');

    } catch (error) {
        console.error('[updateFileMetadata] ERROR:', error);
        throw new Error(`Failed to update file: ${error.message}`);
    }
};

/**
 * Get storage usage info
 */
export const getStorageInfo = (userId) => {
    try {
        const files = getStoredFiles(userId);
        const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
        const fileCount = files.length;

        // Estimate localStorage usage (rough approximation)
        const key = `${STORAGE_KEY}_${userId}`;
        const dataSize = new Blob([localStorage.getItem(key) || '']).size;

        return {
            fileCount,
            totalSize,
            storageUsed: dataSize,
            storageLimit: 5 * 1024 * 1024, // ~5MB typical limit
            percentUsed: (dataSize / (5 * 1024 * 1024)) * 100
        };
    } catch (error) {
        console.error('[getStorageInfo] ERROR:', error);
        return {
            fileCount: 0,
            totalSize: 0,
            storageUsed: 0,
            storageLimit: 5 * 1024 * 1024,
            percentUsed: 0
        };
    }
};
