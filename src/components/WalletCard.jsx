import { useState, useRef } from 'react';
import {
    FaEdit, FaTrash, FaEye, FaEyeSlash, FaCopy, FaDownload, FaShareAlt,
    FaWhatsapp, FaInstagram, FaTelegram, FaSnapchat, FaEnvelope, FaMicrosoft, FaGoogle,
    FaImage, FaFilePdf
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './WalletCard.css';
import ImageLightbox from './ImageLightbox';

const WalletCard = ({ item, onEdit, onDelete }) => {
    const [showSensitive, setShowSensitive] = useState(false);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);
    const cardRef = useRef(null);

    // Determines the "Primary Outcome" value (Large Stat at bottom)
    const getPrimaryOutcome = () => {
        if (item.category === 'payment_cards') {
            return { label: 'Card Ending', value: item.cardNumber ? `•••• ${item.cardNumber.slice(-4)}` : 'N/A', subtext: item.expiryDate || 'Valid' };
        }
        if (item.category === 'identity_docs') {
            return { label: 'Document ID', value: showSensitive ? item.docNumber : '•••• ••••', subtext: 'ID Verified' };
        }
        if (item.category === 'bank_accounts') {
            return { label: 'Account No.', value: showSensitive ? item.accountNumber : `•••• ${item.accountNumber?.slice(-4) || '0000'}`, subtext: item.bankName };
        }
        if (item.category === 'passwords') {
            return { label: 'Password', value: showSensitive ? item.password : '••••••••', subtext: 'Strength: High' };
        }

        // Default - Safe Date Handling
        let year = '2025';
        try {
            if (item.createdAt?.seconds) year = new Date(item.createdAt.seconds * 1000).getFullYear();
            else if (item.createdAt instanceof Date) year = item.createdAt.getFullYear();
            else if (item.updatedAt?.seconds) year = new Date(item.updatedAt.seconds * 1000).getFullYear();
            else if (item.updatedAt instanceof Date) year = item.updatedAt.getFullYear();
        } catch (e) { }

        return { label: 'Created', value: year, subtext: 'Active Item' };
    };

    const outcome = getPrimaryOutcome();

    // Determines tags based on item data
    const getTags = () => {
        const tags = [item.category.replace('_', ' ').toUpperCase()];
        if (item.isFavorite) tags.push('FAVORITE');
        if (item.tags && Array.isArray(item.tags)) tags.push(...item.tags);
        else if (item.tags) tags.push(...item.tags.split(','));
        return tags.slice(0, 3); // Max 3 tags
    };

    const handleCopy = (e, text) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const handleDownload = async (type) => {
        setShowDownloadMenu(false);
        if (type === 'image') {
            const mediaFile = item.files?.find(f => f.type.startsWith('image/'));
            if (mediaFile) {
                // Convert to JPG
                const img = new Image();
                img.src = mediaFile.preview;
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        // Force JPEG format
                        const jpgUrl = canvas.toDataURL('image/jpeg', 0.9);
                        const link = document.createElement('a');
                        link.href = jpgUrl;
                        // Use item title for a readable filename
                        const safeTitle = (item.title || 'wallet-item').replace(/[^a-z0-9]/gi, '_').toLowerCase();
                        link.download = `${safeTitle}_image.jpg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success('Downloaded as JPG');
                    } catch (e) {
                        console.error('Image conversion failed (likely CORS):', e);
                        // Trigger fallback manually
                        img.onerror();
                    }
                };
                img.onerror = () => {
                    // Fallback to original if conversion fails
                    const link = document.createElement('a');
                    link.href = mediaFile.preview;

                    // Try to preserve original extension or default to jpg
                    const vocabName = mediaFile.name || 'image.jpg';
                    const ext = vocabName.split('.').pop() || 'jpg';
                    const safeTitle = (item.title || 'wallet-item').replace(/[^a-z0-9]/gi, '_').toLowerCase();

                    link.download = `${safeTitle}_original.${ext}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.warn('Downloaded original (conversion failed)');
                };
            } else {
                toast.error('No image attachment found.');
            }
        } else if (type === 'pdf') {
            try {
                toast.info('Generating PDF...');
                if (!cardRef.current) return;

                const canvas = await html2canvas(cardRef.current, {
                    scale: 2,
                    backgroundColor: '#0a0a0c', // Dark theme background
                    useCORS: true
                });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`${item.title || 'wallet-item'}.pdf`);
                toast.success('PDF Downloaded');
            } catch (error) {
                console.error('PDF Gen Error:', error);
                toast.error('Failed to generate PDF');
            }
        }
    };

    const handleShare = async (app, shareContainer = false) => {
        setShowShareMenu(false);

        // 1. Prepare Content
        const title = item.title || 'Wallet Item';
        let text = `Shared Item: ${title}\n`;
        if (item.notes) text += `${item.notes}\n`;

        let fileToShare = null;
        let blob = null;

        try {
            if (shareContainer) {
                // CASE A: Share Whole Card (Snapshot)
                // Use html2canvas to capture the card
                toast.info('Generating card snapshot...');
                const canvas = await html2canvas(cardRef.current, {
                    scale: 2,
                    backgroundColor: '#1e1e24', // Ensure dark bg
                    useCORS: true
                });

                // Convert canvas to Blob
                blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
                fileToShare = new File([blob], `${title.replace(/[^a-z0-9]/gi, '_')}_card.jpg`, { type: 'image/jpeg' });

            } else {
                // CASE B: Share Attachment (Original Image)
                const mediaFile = item.files?.find(f => f.type.startsWith('image/'));
                if (mediaFile) {
                    const response = await fetch(mediaFile.preview);
                    blob = await response.blob();
                    const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
                    fileToShare = new File([blob], fileName, { type: blob.type });
                }
            }
        } catch (e) {
            console.error("Preparation failed", e);
            toast.error("Failed to prepare content for sharing");
            return;
        }

        // 3. Handle Native Share (Mobile)
        if (!app && navigator.canShare && fileToShare && navigator.canShare({ files: [fileToShare] })) {
            try {
                await navigator.share({
                    title: title,
                    text: text,
                    files: [fileToShare]
                });
                return;
            } catch (e) {
                if (e.name !== 'AbortError') console.warn('Native share failed');
            }
        }

        // 4. Desktop/Fallback Logic
        const encodedText = encodeURIComponent(text);
        let shareUrl = '';

        switch (app) {
            case 'whatsapp': shareUrl = `https://wa.me/?text=${encodedText}`; break;
            case 'telegram': shareUrl = `https://t.me/share/url?url=https://example.com&text=${encodedText}`; break;
            case 'gmail': shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}`; break;
            case 'outlook': shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}`; break;
            case 'instagram':
            case 'snapchat':
                if (fileToShare) toast.info(`${app} does not support web sharing. Image copied!`);
                break;
            default: break;
        }

        // 5. Copy to Clipboard (Desktop Best Effort)
        if (fileToShare && blob) {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ [blob.type]: blob })
                ]);
                toast.success(shareContainer ? 'Card Snapshot copied!' : 'Image copied! Paste it in the chat.', { autoClose: 4000 });
            } catch (err) {
                navigator.clipboard.writeText(text);
                if (!shareUrl) toast.info('Link/Text copied to clipboard.');
            }
        } else {
            navigator.clipboard.writeText(text);
            if (!shareUrl) toast.success('Info copied to clipboard');
        }

        if (shareUrl) {
            setTimeout(() => window.open(shareUrl, '_blank'), 500);
        }
    };

    const mediaFile = item.files?.find(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
    const docFile = item.files?.find(f => !f.type.startsWith('image/') && !f.type.startsWith('video/'));

    return (
        <>
            <div className="wallet-card" data-category={item.category} ref={cardRef} onMouseLeave={() => { setShowDownloadMenu(false); setShowShareMenu(false); }}>
                {/* 1. Top Image Preview Section */}
                <div className="card-image-section">
                    {mediaFile ? (
                        mediaFile.type.startsWith('video/') ? (
                            <video
                                src={mediaFile.preview}
                                className="card-media-preview"
                                controls={false}
                                muted
                                loop
                                onMouseOver={e => e.target.play()}
                                onMouseOut={e => e.target.pause()}
                                onClick={() => setShowLightbox(true)}
                                style={{ cursor: 'pointer' }}
                            />
                        ) : (
                            <img
                                src={mediaFile.preview}
                                alt="Attachment Preview"
                                className="card-media-preview"
                                onClick={() => setShowLightbox(true)}
                                style={{ cursor: 'pointer' }}
                            />
                        )
                    ) : docFile ? (
                        <div className="doc-visual file-visual">
                            <span style={{ fontSize: '3rem', opacity: 0.5 }}>📄</span>
                        </div>
                    ) : (
                        <div className="doc-visual">
                            <div className="doc-chip"></div>
                            <div className="doc-placeholder-lines">
                                <div className="doc-line medium"></div>
                                <div className="doc-line short"></div>
                                <div className="doc-line"></div>
                            </div>
                        </div>
                    )}

                    <div className="card-type-badge">
                        {item.category === 'passwords' ? 'SECURE LOGIN' : 'OFFICIAL DOC'}
                    </div>
                </div>

                {/* 2. Content Body */}
                <div className="card-content">
                    {/* Tags */}
                    <div className="card-tags">
                        {getTags().map((tag, idx) => (
                            <span key={idx} className="tech-tag">{tag}</span>
                        ))}
                    </div>

                    {/* Title & Description */}
                    <div className="card-title-group">
                        <h3 className="card-title">
                            {item.title || item.cardName || item.docName || item.serviceName || item.bankName || 'Untitled Item'}
                        </h3>
                        <p className="card-description">
                            {item.notes || `Securely stored ${item.category.replace('_', ' ')} information.`}
                        </p>
                    </div>

                    {/* 3. Primary Outcome Box */}
                    <div className="primary-outcome-box">
                        <span className="outcome-label">{outcome.label}</span>
                        <div className="outcome-value-row">
                            <span className="outcome-value">{outcome.value}</span>
                            {/* Interactive Toggles for Sensitive Data */}
                            {['identity_docs', 'passwords', 'bank_accounts'].includes(item.category) && (
                                <button
                                    className="box-toggle-btn"
                                    onClick={(e) => { e.stopPropagation(); setShowSensitive(!showSensitive); }}
                                    title={showSensitive ? "Hide Info" : "Show Info"}
                                >
                                    {showSensitive ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            )}
                        </div>
                        <span className="outcome-subtext">{outcome.subtext}</span>
                    </div>

                    {/* 4. Footer Icons (Actions) */}
                    <div className="card-footer-actions">
                        <div className="relative-wrapper" style={{ position: 'relative' }}>
                            <button
                                className={`card-btn icon-only ${showDownloadMenu ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); setShowDownloadMenu(!showDownloadMenu); setShowShareMenu(false); }}
                                title="Download Options"
                            >
                                <FaDownload />
                            </button>
                            {showDownloadMenu && (
                                <div className="action-popover download-popover">
                                    <button onClick={(e) => { e.stopPropagation(); handleDownload('image'); }}>
                                        <FaImage /> Image
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDownload('pdf'); }}>
                                        <FaFilePdf /> PDF
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="relative-wrapper" style={{ position: 'relative' }}>
                            <button
                                className={`card-btn icon-only ${showShareMenu ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu); setShowDownloadMenu(false); }}
                                title="Share Options"
                            >
                                <FaShareAlt />
                            </button>
                            {showShareMenu && (
                                <div className="action-popover share-popover">
                                    <button onClick={(e) => { e.stopPropagation(); handleShare('whatsapp', true); }} title="WhatsApp"><FaWhatsapp className="brand-wa" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleShare('instagram', true); }} title="Instagram"><FaInstagram className="brand-ig" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleShare('gmail', true); }} title="Gmail"><FaGoogle className="brand-gmail" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleShare('outlook', true); }} title="Outlook"><FaMicrosoft className="brand-outlook" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleShare('telegram', true); }} title="Telegram"><FaTelegram className="brand-tg" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleShare('snapchat', true); }} title="Snapchat"><FaSnapchat className="brand-snap" /></button>
                                </div>
                            )}
                        </div>

                        {(item.cardNumber || item.docNumber || item.password) && (
                            <button
                                className="card-btn icon-only"
                                onClick={(e) => handleCopy(e, item.cardNumber || item.docNumber || item.password)}
                                title="Copy Value"
                            >
                                <FaCopy />
                            </button>
                        )}

                        <button
                            className="card-btn primary"
                            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                            title="Edit Details"
                        >
                            <FaEdit /> <span>Edit</span>
                        </button>

                        <button
                            className="card-btn danger icon-only"
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                            title="Delete Item"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>
            </div>

            {/* Lightbox - Conditional Render */}
            {showLightbox && mediaFile && (
                <ImageLightbox
                    imageSrc={mediaFile.preview}
                    onClose={() => setShowLightbox(false)}
                    onDownload={handleDownload}
                    onShare={(app) => handleShare(app, false)}
                />
            )}
        </>
    );
};

export default WalletCard;
