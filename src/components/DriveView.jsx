import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaDownload, FaTrash, FaFile, FaImage, FaVideo, FaFilePdf, FaFileWord, FaFileExcel, FaEdit, FaShare, FaCloudDownloadAlt, FaEllipsisV } from 'react-icons/fa';
import { useDriveFiles } from '../hooks/useDriveFiles';

import ConfirmDialog from './ConfirmDialog';
import Analytics from './Analytics';
import ImagePreview from './ImagePreview';
import VideoPreview from './VideoPreview';
import './DriveView.css';

const DriveView = ({ user }) => {
    const { files, loading, uploading, uploadFile, deleteFile, renameFile, toggleOffline, downloadFile } = useDriveFiles(user);
    const [filter, setFilter] = useState('all');
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, fileId: null, fileName: null, storagePath: null });
    const [renameDialog, setRenameDialog] = useState({ isOpen: false, fileId: null, currentName: '', newName: '' });
    const [menuOpen, setMenuOpen] = useState(null); // Track which file's menu is open
    const [view, setView] = useState('grid'); // 'grid' or 'analytics'

    const onDrop = async (acceptedFiles) => {
        for (const file of acceptedFiles) {
            try {
                // Check for duplicate names
                const duplicateExists = files.some(existingFile =>
                    existingFile.name.toLowerCase() === file.name.toLowerCase()
                );

                if (duplicateExists) {
                    toast.error(`File "${file.name}" already exists`);
                    continue; // Skip this file
                }

                await uploadFile(file, {
                    category: getFileCategory(file.type),
                    tags: []
                });
            } catch (error) {
                console.error('Upload failed:', error);
            }
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        disabled: uploading
    });

    const handleDeleteClick = (fileId, fileName, storagePath = null) => {
        setConfirmDialog({ isOpen: true, fileId, fileName, storagePath });
        setMenuOpen(null);
    };

    const handleConfirmDelete = async () => {
        const { fileId, fileName, storagePath } = confirmDialog;
        setConfirmDialog({ isOpen: false, fileId: null, fileName: null, storagePath: null });
        await deleteFile(fileId, fileName, storagePath);
    };

    const handleCancelDelete = () => {
        setConfirmDialog({ isOpen: false, fileId: null, fileName: null, storagePath: null });
    };

    // Rename handlers
    const handleRenameClick = (fileId, currentName) => {
        setRenameDialog({ isOpen: true, fileId, currentName, newName: currentName });
        setMenuOpen(null);
    };

    const handleRenameSubmit = async () => {
        const { fileId, newName } = renameDialog;
        if (newName && newName.trim()) {
            // Check for duplicate names
            const duplicateExists = files.some(file =>
                file.id !== fileId && file.name.toLowerCase() === newName.trim().toLowerCase()
            );

            if (duplicateExists) {
                toast.error('A file with this name already exists');
                return;
            }

            await renameFile(fileId, newName.trim());
            setRenameDialog({ isOpen: false, fileId: null, currentName: '', newName: '' });
        }
    };

    const handleRenameCancel = () => {
        setRenameDialog({ isOpen: false, fileId: null, currentName: '', newName: '' });
    };

    // Download with proper format
    const handleDownload = async (file) => {
        try {
            const { url, name, type } = await getFileData(file.id);

            // Create a link with the specific blob type if possible to preserve format
            // getFileData already returns a blob URL with the correct type
            const link = document.createElement('a');
            link.href = url;
            link.download = name || file.name; // This name includes extension like .png, .pdf
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url); // Clean up

            toast.success('Download started');
        } catch (error) {
            console.error('[handleDownload] ERROR:', error);
            toast.error('Failed to download file');
        }
        setMenuOpen(null);
    };

    // Share file
    const handleShare = async (file) => {
        if (navigator.share) {
            try {
                // Convert base64 to blob for sharing
                const response = await fetch(file.data);
                const blob = await response.blob();
                const shareFile = new File([blob], file.name, { type: file.type });

                await navigator.share({
                    title: file.name,
                    text: `Check out this file: ${file.name}`,
                    files: [shareFile]
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    // Fallback: copy link
                    navigator.clipboard.writeText(window.location.href);
                    toast.info('Link copied to clipboard');
                }
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(file.name);
            toast.info('File name copied to clipboard');
        }
        setMenuOpen(null);
    };

    // Toggle offline status
    const handleToggleOffline = (fileId, isOffline) => {
        toggleOffline(fileId, isOffline);
        setMenuOpen(null);
    };

    const getFileCategory = (type) => {
        if (type.startsWith('image/')) return 'images';
        if (type.startsWith('video/')) return 'videos';
        if (type.includes('pdf')) return 'documents';
        if (type.includes('word') || type.includes('document')) return 'documents';
        if (type.includes('sheet') || type.includes('excel')) return 'documents';
        return 'general';
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return <FaImage className="file-icon image" />;
        if (type.startsWith('video/')) return <FaVideo className="file-icon video" />;
        if (type.includes('pdf')) return <FaFilePdf className="file-icon pdf" />;
        if (type.includes('word')) return <FaFileWord className="file-icon word" />;
        if (type.includes('sheet') || type.includes('excel')) return <FaFileExcel className="file-icon excel" />;
        return <FaFile className="file-icon" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (timestamp) => {
        if (!timestamp?.seconds) return 'Just now';
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const filteredFiles = filter === 'all'
        ? files
        : files.filter(f => f.category === filter);

    if (loading) {
        return (
            <div className="drive-view">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading your files...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="drive-view">


            {/* Upload Zone */}
            <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}>
                <input {...getInputProps()} />
                <FaUpload className="upload-icon" />
                {uploading ? (
                    <p>Uploading your files...</p>
                ) : isDragActive ? (
                    <p>✨ Drop your files here</p>
                ) : (
                    <>
                        <p>Click to upload or drag files here</p>
                        <span className="upload-hint">Images, videos, documents - all supported</span>
                    </>
                )}
            </div>

            {/* Prevent native browser drag popup */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    zIndex: -1
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
            />

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    All Files ({files.length})
                </button>
                <button
                    className={filter === 'images' ? 'active' : ''}
                    onClick={() => setFilter('images')}
                >
                    Images ({files.filter(f => f.category === 'images').length})
                </button>
                <button
                    className={filter === 'videos' ? 'active' : ''}
                    onClick={() => setFilter('videos')}
                >
                    Videos ({files.filter(f => f.category === 'videos').length})
                </button>
                <button
                    className={filter === 'documents' ? 'active' : ''}
                    onClick={() => setFilter('documents')}
                >
                    Documents ({files.filter(f => f.category === 'documents').length})
                </button>
            </div>

            {/* View Toggle */}
            <div className="view-toggle">
                <button
                    className={view === 'grid' ? 'active' : ''}
                    onClick={() => setView('grid')}
                >
                    📁 Files
                </button>
                <button
                    className={view === 'analytics' ? 'active' : ''}
                    onClick={() => setView('analytics')}
                >
                    📊 Analytics
                </button>
            </div>

            {/* Analytics Dashboard */}
            {view === 'analytics' && <Analytics user={user} files={files} />}

            {/* Files Grid */}
            {view === 'grid' && filteredFiles.length === 0 ? (
                <div className="empty-state">
                    <FaFile className="empty-icon" />
                    <p>No files yet</p>
                    <span>Upload your first file to get started</span>
                </div>
            ) : (
                <div className="files-grid">
                    {filteredFiles.map((file) => (
                        <div key={file.id} className="file-card">
                            {/* Preview */}
                            <div className="file-preview">
                                {file.type.startsWith('image/') ? (
                                    <ImagePreview fileId={file.id} fileName={file.name} />
                                ) : file.type.startsWith('video/') ? (
                                    <VideoPreview fileId={file.id} fileName={file.name} />
                                ) : (
                                    <div className="file-icon-wrapper">
                                        {getFileIcon(file.type)}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="file-info">
                                <h3 className="file-name" title={file.name}>{file.name}</h3>
                                <div className="file-meta">
                                    <span className="file-size">{formatFileSize(file.size)}</span>
                                    <span className="file-date">{formatDate(file.createdAt)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="file-actions">
                                {/* Offline indicator */}
                                {file.isOffline && (
                                    <span className="offline-badge" title="Available offline">
                                        <FaCloudDownloadAlt />
                                    </span>
                                )}

                                {/* Quick download */}
                                <button
                                    className="btn-icon"
                                    onClick={() => handleDownload(file)}
                                    title="Download"
                                >
                                    <FaDownload />
                                </button>

                                {/* More options menu */}
                                <div className="file-menu-wrapper">
                                    <button
                                        className="btn-icon"
                                        onClick={() => setMenuOpen(menuOpen === file.id ? null : file.id)}
                                        title="More options"
                                    >
                                        <FaEllipsisV />
                                    </button>

                                    {menuOpen === file.id && (
                                        <div className="file-menu">
                                            <button onClick={() => handleRenameClick(file.id, file.name)}>
                                                <FaEdit /> Rename
                                            </button>
                                            <button onClick={() => handleShare(file)}>
                                                <FaShare /> Share
                                            </button>
                                            <button onClick={() => handleToggleOffline(file.id, file.isOffline)}>
                                                <FaCloudDownloadAlt /> {file.isOffline ? 'Remove from offline' : 'Make available offline'}
                                            </button>
                                            <button
                                                className="danger-option"
                                                onClick={() => handleDeleteClick(file.id, file.name, file.storagePath)}
                                            >
                                                <FaTrash /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Delete File?"
                message="Are you sure you want to delete this file?"
                fileName={confirmDialog.fileName}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />

            {/* Rename Dialog */}
            {renameDialog.isOpen && (
                <div className="confirm-overlay" onClick={handleRenameCancel}>
                    <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                        <h2 className="confirm-title">Rename File</h2>
                        <div className="rename-input-wrapper">
                            <input
                                type="text"
                                value={renameDialog.newName}
                                onChange={(e) => setRenameDialog({ ...renameDialog, newName: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && handleRenameSubmit()}
                                autoFocus
                                className={`rename-input ${files.some(f => f.id !== renameDialog.fileId && f.name.toLowerCase() === renameDialog.newName.trim().toLowerCase())
                                    ? 'input-error'
                                    : ''
                                    }`}
                            />
                            {files.some(f => f.id !== renameDialog.fileId && f.name.toLowerCase() === renameDialog.newName.trim().toLowerCase()) && (
                                <span className="error-message">⚠️ A file with this name already exists</span>
                            )}
                        </div>
                        <div className="confirm-actions">
                            <button className="btn btn-secondary" onClick={handleRenameCancel}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleRenameSubmit}>
                                Rename
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriveView;
