import { FaCloud, FaCloudUploadAlt, FaWifi, FaSlash } from 'react-icons/fa';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import './SyncStatus.css';

const SyncStatus = () => {
    const isOnline = useNetworkStatus();

    return (
        <div className={`sync-status ${isOnline ? 'online' : 'offline'}`} title={isOnline ? "Online & Synced" : "Offline (Saved Locally)"}>
            {isOnline ? (
                <>
                    <FaCloud className="sync-icon" />
                    <span className="sync-text">Synced</span>
                </>
            ) : (
                <>
                    <FaWifi className="sync-icon" opacity={0.5} />
                    <span className="sync-text">Offline</span>
                </>
            )}
        </div>
    );
};

export default SyncStatus;
