import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import { encryptData, decryptData } from '../utils/encryption';

/**
 * File Upload and Management Service
 * Handles encrypted file uploads to Firebase Storage
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

/**
 * Upload a file to Firebase Storage
 */
export const uploadFile = async (file, userId, itemId, encryptionKey) => {
    try {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            throw new Error('File type not allowed');
        }

        // Read file as array buffer
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Convert to base64 for encryption
        const base64 = btoa(String.fromCharCode(...uint8Array));

        // Encrypt file data
        const encryptedData = encryptData(base64, encryptionKey);

        // Create file reference
        const timestamp = Date.now();
        const fileName = `${userId}/${itemId}/${timestamp}_${file.name}`;
        const fileRef = ref(storage, fileName);

        // Upload encrypted data
        const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
        await uploadBytes(fileRef, blob);

        // Get download URL
        const downloadURL = await getDownloadURL(fileRef);

        return {
            id: timestamp.toString(),
            name: file.name,
            type: file.type,
            size: file.size,
            url: downloadURL,
            path: fileName,
            uploadedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('File upload error:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }
};

/**
 * Delete a file from Firebase Storage
 */
export const deleteFile = async (filePath) => {
    try {
        const fileRef = ref(storage, filePath);
        await deleteObject(fileRef);
    } catch (error) {
        console.error('File delete error:', error);
        throw new Error('Failed to delete file');
    }
};

/**
 * Download and decrypt a file
 */
export const downloadFile = async (fileUrl, fileName, encryptionKey) => {
    try {
        const response = await fetch(fileUrl);
        const encryptedData = await response.text();

        // Decrypt file data
        const base64 = decryptData(encryptedData, encryptionKey);

        // Convert base64 back to binary
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Create blob and download
        const blob = new Blob([bytes]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('File download error:', error);
        throw new Error('Failed to download file');
    }
};

/**
 * Get file icon based on type
 */
export const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.startsWith('text/')) return '📃';
    return '📎';
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
