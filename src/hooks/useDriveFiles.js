import { useState, useEffect, useCallback } from 'react';
import { uploadFile, deleteFile, subscribeToFiles, updateFileMetadata, getFileData } from '../services/indexedDBService';
import { toast } from 'react-toastify';

/**
 * Hook for managing Google Drive-like file storage
 */
export const useDriveFiles = (user) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Subscribe to files
    useEffect(() => {
        if (!user) {
            setFiles([]);
            setLoading(false);
            return;
        }

        console.log('[useDriveFiles] Setting up subscription');
        setLoading(true);

        const unsubscribe = subscribeToFiles(
            user.uid,
            (data) => {
                console.log('[useDriveFiles] Received', data.length, 'files');
                setFiles(data);
                setLoading(false);
            },
            (error) => {
                console.error('[useDriveFiles] Subscription error:', error);
                toast.error('Failed to load files');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Upload file
    const handleUpload = useCallback(async (file, metadata = {}) => {
        if (!user) {
            toast.error('Please log in to upload files');
            return;
        }

        setUploading(true);
        console.log('[useDriveFiles] Starting upload:', file.name);

        try {
            const newFile = await uploadFile(user.uid, file, metadata);

            // Manually add the new file to the list
            setFiles(prevFiles => [newFile, ...prevFiles]);

            toast.success(`${file.name} uploaded successfully!`);
        } catch (error) {
            console.error('[useDriveFiles] Upload error:', error);
            toast.error(`Failed to upload ${file.name}`);
            throw error;
        } finally {
            setUploading(false);
        }
    }, [user]);

    // Delete file
    const handleDelete = useCallback(async (fileId, fileName) => {
        if (!user) return;

        console.log('[useDriveFiles] Deleting:', fileName);

        try {
            await deleteFile(user.uid, fileId);

            // Manually update the files list by filtering out the deleted file
            setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));

            toast.success(`${fileName} deleted`);
        } catch (error) {
            console.error('[useDriveFiles] Delete error:', error);
            toast.error(`Failed to delete ${fileName}`);
            throw error;
        }
    }, [user]);

    // Rename file
    const handleRename = useCallback(async (fileId, newName) => {
        if (!user) return;

        console.log('[useDriveFiles] Renaming file:', fileId, 'to', newName);

        try {
            await updateFileMetadata(user.uid, fileId, { name: newName });

            // Manually update the file name in the list
            setFiles(prevFiles =>
                prevFiles.map(f =>
                    f.id === fileId ? { ...f, name: newName } : f
                )
            );

            toast.success('File renamed successfully');
        } catch (error) {
            console.error('[useDriveFiles] Rename error:', error);
            toast.error('Failed to rename file');
            throw error;
        }
    }, [user]);

    // Toggle offline availability
    const handleToggleOffline = useCallback(async (fileId, isOffline) => {
        if (!user) return;

        try {
            await updateFileMetadata(user.uid, fileId, { isOffline: !isOffline });

            // Manually update the offline status
            setFiles(prevFiles =>
                prevFiles.map(f =>
                    f.id === fileId ? { ...f, isOffline: !isOffline } : f
                )
            );

            toast.success(isOffline ? 'Removed from offline' : 'Available offline');
        } catch (error) {
            console.error('[useDriveFiles] Toggle offline error:', error);
            toast.error('Failed to update offline status');
        }
    }, [user]);

    // Download file
    const handleDownload = useCallback(async (fileId, fileName) => {
        try {
            const { url, name } = await getFileData(fileId);
            const link = document.createElement('a');
            link.href = url;
            link.download = name || fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url); // Clean up
            toast.success('Download started');
        } catch (error) {
            console.error('[handleDownload] ERROR:', error);
            toast.error('Failed to download file');
        }
    }, []);

    return {
        files,
        loading,
        uploading,
        uploadFile: handleUpload,
        deleteFile: handleDelete,
        renameFile: handleRename,
        toggleOffline: handleToggleOffline,
        downloadFile: handleDownload
    };
};
