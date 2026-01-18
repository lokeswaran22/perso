/**
 * FIREBASE CLOUD STORAGE SERVICE - Google Drive-like Unlimited Storage
 * Uses Firebase Storage for files (unlimited) + Firestore for metadata
 */

import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore';
import { storage, db } from '../config/firebase';

/**
 * Upload file to Firebase Storage with progress tracking
 */
export const uploadFile = async (userId, file, metadata = {}, onProgress = null) => {
    console.log('[uploadFile] Starting upload:', file.name, 'Size:', file.size);

    try {
        // Create unique file path
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storagePath = `users/${userId}/files/${fileName}`;
        const storageRef = ref(storage, storagePath);

        // Start upload with resumable upload
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Return promise that tracks progress
        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Progress tracking
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`[uploadFile] Upload is ${progress}% done`);
                    if (onProgress) onProgress(progress);
                },
                (error) => {
                    // Handle errors
                    console.error('[uploadFile] Upload ERROR:', error);
                    reject(error);
                },
                async () => {
                    // Upload completed successfully
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        console.log('[uploadFile] File available at:', downloadURL);

                        // Save metadata to Firestore
                        const fileMetadata = {
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            downloadURL,
                            storagePath,
                            category: metadata.category || getCategory(file.type),
                            tags: metadata.tags || [],
                            notes: metadata.notes || '',
                            isFavorite: metadata.isFavorite || false,
                            isOffline: metadata.isOffline || false,
                            createdAt: { seconds: Date.now() / 1000 },
                            updatedAt: { seconds: Date.now() / 1000 }
                        };

                        const filesRef = collection(db, `users/${userId}/files`);
                        const docRef = await addDoc(filesRef, fileMetadata);

                        console.log('[uploadFile] ✅ Success! Doc ID:', docRef.id);

                        resolve({
                            id: docRef.id,
                            ...fileMetadata
                        });
                    } catch (error) {
                        console.error('[uploadFile] Metadata save ERROR:', error);
                        reject(error);
                    }
                }
            );
        });

    } catch (error) {
        console.error('[uploadFile] ERROR:', error);
        throw error;
    }
};

/**
 * Delete file from Firebase Storage and Firestore
 */
export const deleteFile = async (userId, fileId, storagePath) => {
    console.log('[deleteFile] Deleting:', fileId);

    try {
        // Delete from Storage
        if (storagePath) {
            const storageRef = ref(storage, storagePath);
            await deleteObject(storageRef);
            console.log('[deleteFile] Deleted from Storage');
        }

        // Delete from Firestore
        const docRef = doc(db, `users/${userId}/files`, fileId);
        await deleteDoc(docRef);
        console.log('[deleteFile] ✅ Deleted successfully');

    } catch (error) {
        console.error('[deleteFile] ERROR:', error);
        throw new Error(`Failed to delete file: ${error.message}`);
    }
};

/**
 * Subscribe to files in real-time
 */
export const subscribeToFiles = (userId, callback, onError) => {
    console.log('[subscribeToFiles] Setting up subscription for user:', userId);

    try {
        const filesRef = collection(db, `users/${userId}/files`);
        const q = query(filesRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const files = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                console.log('[subscribeToFiles] Loaded', files.length, 'files');
                callback(files);
            },
            (error) => {
                console.error('[subscribeToFiles] ERROR:', error);
                if (onError) onError(error);
            }
        );

        return unsubscribe;

    } catch (error) {
        console.error('[subscribeToFiles] Setup ERROR:', error);
        if (onError) onError(error);
        return () => { };
    }
};

/**
 * Update file metadata
 */
export const updateFileMetadata = async (userId, fileId, updates) => {
    console.log('[updateFileMetadata] Updating:', fileId);

    try {
        const docRef = doc(db, `users/${userId}/files`, fileId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: { seconds: Date.now() / 1000 }
        });
        console.log('[updateFileMetadata] ✅ Success');

    } catch (error) {
        console.error('[updateFileMetadata] ERROR:', error);
        throw new Error(`Failed to update file: ${error.message}`);
    }
};

/**
 * Get storage usage info from Firebase
 */
export const getStorageInfo = async (userId) => {
    try {
        const filesRef = collection(db, `users/${userId}/files`);
        const snapshot = await getDocs(filesRef);

        const files = snapshot.docs.map(doc => doc.data());
        const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
        const fileCount = files.length;

        // Firebase Storage limits
        const storageLimit = 5 * 1024 * 1024 * 1024; // 5GB free tier
        const percentUsed = (totalSize / storageLimit) * 100;

        return {
            fileCount,
            totalSize,
            storageUsed: totalSize,
            storageLimit,
            percentUsed
        };
    } catch (error) {
        console.error('[getStorageInfo] ERROR:', error);
        return {
            fileCount: 0,
            totalSize: 0,
            storageUsed: 0,
            storageLimit: 5 * 1024 * 1024 * 1024,
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

// Import getDocs for getStorageInfo
import { getDocs } from 'firebase/firestore';
