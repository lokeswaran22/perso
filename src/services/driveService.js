import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-toastify';

/**
 * SUPER SIMPLE file storage - stores files as base64 in Firestore
 * NO Firebase Storage, NO CORS issues, NO complexity
 * Works immediately!
 */

const getUserFilesCollection = (userId) => {
    return collection(db, 'users', userId, 'files');
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
 * Upload a file - stores as base64 in Firestore
 */
export const uploadFile = async (userId, file, metadata = {}) => {
    console.log('[uploadFile] Starting upload:', file.name, 'Size:', file.size);

    try {
        // Check file size (Firestore has 1MB document limit)
        const maxSize = 900 * 1024; // 900KB to be safe
        if (file.size > maxSize) {
            throw new Error(`File too large. Maximum size is ${Math.round(maxSize / 1024)}KB. Your file is ${Math.round(file.size / 1024)}KB.`);
        }

        // Convert to base64
        console.log('[uploadFile] Converting to base64...');
        const base64Data = await fileToBase64(file);
        console.log('[uploadFile] Conversion complete');

        // Save to Firestore
        const fileData = {
            name: file.name,
            size: file.size,
            type: file.type,
            data: base64Data, // Store the actual file data
            category: metadata.category || 'general',
            tags: metadata.tags || [],
            notes: metadata.notes || '',
            isFavorite: metadata.isFavorite || false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        console.log('[uploadFile] Saving to Firestore...');
        const docRef = await addDoc(getUserFilesCollection(userId), fileData);
        console.log('[uploadFile] Success! File ID:', docRef.id);

        return {
            id: docRef.id,
            ...fileData
        };

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
        const docRef = doc(db, 'users', userId, 'files', fileId);
        await deleteDoc(docRef);
        console.log('[deleteFile] Deleted successfully');

    } catch (error) {
        console.error('[deleteFile] ERROR:', error);
        throw new Error(`Failed to delete file: ${error.message}`);
    }
};

/**
 * Subscribe to user's files in real-time
 */
export const subscribeToFiles = (userId, callback, onError) => {
    console.log('[subscribeToFiles] Setting up subscription for user:', userId);

    try {
        const filesCollection = getUserFilesCollection(userId);
        const q = query(filesCollection);

        const unsubscribe = onSnapshot(q,
            (querySnapshot) => {
                const files = [];
                querySnapshot.forEach((doc) => {
                    files.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                // Sort by creation date (newest first)
                files.sort((a, b) => {
                    const timeA = a.createdAt?.seconds || 0;
                    const timeB = b.createdAt?.seconds || 0;
                    return timeB - timeA;
                });

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
        throw error;
    }
};

/**
 * Update file metadata
 */
export const updateFileMetadata = async (userId, fileId, updates) => {
    console.log('[updateFileMetadata] Updating:', fileId);

    try {
        const docRef = doc(db, 'users', userId, 'files', fileId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        console.log('[updateFileMetadata] Success');

    } catch (error) {
        console.error('[updateFileMetadata] ERROR:', error);
        throw new Error(`Failed to update file: ${error.message}`);
    }
};
