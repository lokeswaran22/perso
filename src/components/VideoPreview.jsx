import { useState, useEffect } from 'react';
import { getFileData } from '../services/indexedDBService';

const VideoPreview = ({ fileId, fileName }) => {
    const [videoUrl, setVideoUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let objectUrl = null;

        const loadVideo = async () => {
            try {
                setLoading(true);
                const { url } = await getFileData(fileId);
                objectUrl = url;
                setVideoUrl(url);
                setError(null);
            } catch (err) {
                console.error('[VideoPreview] Error loading video:', err);
                setError('Failed to load video');
            } finally {
                setLoading(false);
            }
        };

        loadVideo();

        // Cleanup: revoke object URL when component unmounts
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [fileId]);

    if (loading) {
        return (
            <div className="preview-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="preview-error">
                <span>🎥</span>
            </div>
        );
    }

    return <video src={videoUrl} controls />;
};

export default VideoPreview;
