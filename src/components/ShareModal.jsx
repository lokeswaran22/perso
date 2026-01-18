import { useState, useEffect } from 'react';
import { FaTimes, FaCopy, FaLock, FaQrcode, FaExternalLinkAlt } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';
import './ShareModal.css';

const ShareModal = ({ item, onClose }) => {
    const [password, setPassword] = useState('');
    const [expiry, setExpiry] = useState('1h'); // 1h, 24h, 7d
    const [shareLink, setShareLink] = useState('');
    const [step, setStep] = useState(1); // 1: Config, 2: Result

    // Generate a random password for the share link if user doesn't provide one? 
    // Or just use a shared secret. For this "offline" sharing, we'll encrypt 
    // the item data into a blob and user needs to send the blob + password.
    // Ideally, we'd upload to a temp location. 
    // Since we don't have a backend specifically for this, let's do:
    // "Secure Text Snippet": Encrypt item JSON with a one-time password.

    const generateShareableCode = () => {
        if (!password) {
            toast.error('Please set a password for encryption');
            return;
        }

        try {
            // Create a clean object to share (remove ID, timestamps, system fields)
            const shareData = {
                category: item.category,
                ...item,
                id: undefined,
                createdAt: undefined,
                updatedAt: undefined,
                userId: undefined,
                sharedAt: new Date().toISOString()
            };

            // Encrypt with the provided password
            const encrypted = CryptoJS.AES.encrypt(JSON.stringify(shareData), password).toString();

            // In a real app, we might upload this `encrypted` string to a KV store (e.g. Firebase/Redis) 
            // and get a short ID. For this demo, we'll share the encrypted string itself 
            // formatted as a URL param or just a raw string to start.

            // Let's pretend we have a viewer app.
            // const link = `${window.location.origin}/share?data=${encodeURIComponent(encrypted)}`;

            // For now, let's just give them the encrypted blob to "Import"
            setShareLink(encrypted);
            setStep(2);
        } catch (error) {
            console.error('Encryption error:', error);
            toast.error('Failed to generate share code');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink);
        toast.success('Encrypted code copied!');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal share-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3><FaLock /> Secure Share</h3>
                    <button className="btn-icon" onClick={onClose}><FaTimes /></button>
                </div>

                <div className="modal-body">
                    {step === 1 ? (
                        <>
                            <div className="share-info">
                                <p>Create an encrypted copy of <strong>{item.title || 'this item'}</strong> to share.</p>
                                <p className="text-sm text-secondary">The recipient will need the password you set below to decrypt it.</p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Set One-Time Password</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Enter a secure password..."
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setPassword(Math.random().toString(36).slice(-8))}
                                        title="Generate Random"
                                    >
                                        Auto
                                    </button>
                                </div>
                            </div>

                            <div className="share-actions">
                                <button className="btn btn-primary full-width" onClick={generateShareableCode}>
                                    Generate Encrypted Code
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="share-result">
                            <div className="qr-container">
                                <QRCodeSVG value={shareLink} size={150} />
                            </div>

                            <div className="share-link-box">
                                <label className="text-sm">Encrypted Data Blob</label>
                                <textarea
                                    className="textarea share-textarea"
                                    readOnly
                                    value={shareLink}
                                    onClick={e => e.target.select()}
                                />
                                <div className="share-actions-row">
                                    <button className="btn btn-outline full-width mt-2" onClick={copyToClipboard}>
                                        <FaCopy /> Copy
                                    </button>

                                    {navigator.share && (
                                        <button className="btn btn-primary full-width mt-2" onClick={() => {
                                            navigator.share({
                                                title: 'Secure Item Share',
                                                text: shareLink,
                                            }).then(() => toast.success('Shared successfully'))
                                                .catch((e) => console.log('Share canceled', e));
                                        }}>
                                            <FaExternalLinkAlt /> Share App
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="share-footer text-center mt-4">
                                <p className="text-sm text-warning">
                                    Share this code securely. Don't send the password via the same channel.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
