import { useState, useEffect } from 'react';
import { getFileData } from '../services/indexedDBService';

const ImagePreview = ({ fileId, fileName }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let objectUrl = null;

        const loadImage = async () => {
            try {
                setLoading(true);
                const { url } = await getFileData(fileId);
                objectUrl = url;
                setImageUrl(url);
                setError(null);
            } catch (err) {
                console.error('[ImagePreview] Error loading image:', err);
                setError('Failed to load image');
            } finally {
                setLoading(false);
            }
        };

        loadImage();

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
                <span>📷</span>
            </div>
        );
    }

    return <img src={imageUrl} alt={fileName} />;
};

export default ImagePreview;
