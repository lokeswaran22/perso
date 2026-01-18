import { useState, useEffect } from 'react';
import { getStorageInfo } from '../services/localStorageService';
import { FaDatabase, FaInfoCircle } from 'react-icons/fa';
import './StorageInfo.css';

const StorageInfo = ({ user }) => {
    const [info, setInfo] = useState(null);

    useEffect(() => {
        if (user) {
            const storageInfo = getStorageInfo(user.uid);
            setInfo(storageInfo);
        }
    }, [user]);

    if (!info) return null;

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getStorageColor = () => {
        if (info.percentUsed < 50) return '#10b981'; // Green
        if (info.percentUsed < 80) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    return (
        <div className="storage-info">
            <div className="storage-header">
                <FaDatabase className="storage-icon" />
                <span className="storage-title">Storage Usage</span>
            </div>

            <div className="storage-bar-container">
                <div
                    className="storage-bar"
                    style={{
                        width: `${Math.min(info.percentUsed, 100)}%`,
                        backgroundColor: getStorageColor()
                    }}
                />
            </div>

            <div className="storage-details">
                <span>{formatBytes(info.storageUsed)} / {formatBytes(info.storageLimit)}</span>
                <span>{info.fileCount} files</span>
            </div>

            {info.percentUsed > 80 && (
                <div className="storage-warning">
                    <FaInfoCircle />
                    <span>Storage almost full. Delete some files to free up space.</span>
                </div>
            )}
        </div>
    );
};

export default StorageInfo;
