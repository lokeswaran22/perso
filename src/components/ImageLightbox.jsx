import React, { useState } from 'react';
import { FaTimes, FaDownload, FaShareAlt, FaWhatsapp, FaInstagram, FaTelegram, FaSnapchat, FaGoogle, FaMicrosoft } from 'react-icons/fa';
import './ImageLightbox.css';

const ImageLightbox = ({ imageSrc, onClose, onDownload, onShare }) => {
    const [showShareMenu, setShowShareMenu] = useState(false);

    if (!imageSrc) return null;

    return (
        <div className="lightbox-overlay" onClick={onClose}>
            <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                {/* Close Button - Top Right Fixed */}
                <button className="lightbox-btn close-btn" onClick={onClose} title="Close">
                    <FaTimes />
                </button>

                <img src={imageSrc} alt="Maximized" className="lightbox-image" />

                <div className="lightbox-controls">
                    <div className="lightbox-actions">
                        <button className="lightbox-btn" onClick={() => onDownload('image')} title="Download Image">
                            <FaDownload />
                        </button>

                        <div className="relative-wrapper">
                            <button
                                className={`lightbox-btn ${showShareMenu ? 'active' : ''}`}
                                onClick={() => setShowShareMenu(!showShareMenu)}
                                title="Share"
                            >
                                <FaShareAlt />
                            </button>

                            {showShareMenu && (
                                <div className="action-popover share-popover lightbox-share-menu">
                                    <button onClick={() => onShare('whatsapp')} title="WhatsApp"><FaWhatsapp className="brand-wa" /></button>
                                    <button onClick={() => onShare('instagram')} title="Instagram"><FaInstagram className="brand-ig" /></button>
                                    <button onClick={() => onShare('gmail')} title="Gmail"><FaGoogle className="brand-gmail" /></button>
                                    <button onClick={() => onShare('outlook')} title="Outlook"><FaMicrosoft className="brand-outlook" /></button>
                                    <button onClick={() => onShare('telegram')} title="Telegram"><FaTelegram className="brand-tg" /></button>
                                    <button onClick={() => onShare('snapchat')} title="Snapchat"><FaSnapchat className="brand-snap" /></button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageLightbox;
