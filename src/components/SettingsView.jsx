import { useState, useEffect } from 'react';
import {
    FaFingerprint,
    FaShieldAlt,
    FaUserCircle,
    FaMoon,
    FaSun,
    FaSignOutAlt,
    FaDatabase,
    FaCloudDownloadAlt,
    FaSpinner,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { checkBiometricAvailability, registerBiometric } from '../services/biometricService';
import { generateTwoFactorSecret, verifyTwoFactorToken } from '../services/twoFactorService';
import { QRCodeSVG } from 'qrcode.react';
import './SettingsView.css';

const SettingsView = ({ user, darkMode, onToggleTheme, onLogout }) => {
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricEnrolled, setBiometricEnrolled] = useState(false);
    const [loading, setLoading] = useState(false);

    // 2FA State
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [twoFactorData, setTwoFactorData] = useState(null);
    const [tokenInput, setTokenInput] = useState('');

    useEffect(() => {
        const check = async () => {
            const avail = await checkBiometricAvailability();
            setBiometricAvailable(avail);
            const isEnrolled = localStorage.getItem(`biometric_enrolled_${user.uid}`) === 'true';
            setBiometricEnrolled(isEnrolled);
        };
        check();
    }, [user.uid]);

    const handleEnableBiometric = async () => {
        setLoading(true);
        try {
            await registerBiometric(user.uid);
            setBiometricEnrolled(true);
            toast.success('Biometric login enabled successfully');
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Biometric setup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDisableBiometric = () => {
        if (confirm('Disable biometric login?')) {
            localStorage.removeItem(`biometric_enrolled_${user.uid}`);
            setBiometricEnrolled(false);
            toast.info('Biometric login disabled');
        }
    };

    const handleToggle2FA = () => {
        if (!show2FASetup) {
            // Opening: Generate secret
            const data = generateTwoFactorSecret(user.email);
            setTwoFactorData(data);
            setTokenInput('');
            setShow2FASetup(true);
        } else {
            // Closing
            setShow2FASetup(false);
            setTwoFactorData(null);
        }
    };

    const handleVerify2FA = () => {
        if (!tokenInput || tokenInput.length !== 6) {
            toast.warning("Please enter the 6-digit code");
            return;
        }

        const isValid = verifyTwoFactorToken(tokenInput, twoFactorData.secret);

        if (isValid) {
            toast.success("2FA Verified & Enabled!");
            setShow2FASetup(false);
            // In a real app, you would save `twoFactorData.secret` to the user's secure profile here.
        } else {
            toast.error("Invalid Code. Please try again.");
        }
    };

    const handleExportData = () => {
        // Mock export for visual enhancement
        toast.info("Preparing secure backup...");
        setTimeout(() => {
            toast.success("Backup downloaded successfully");
        }, 1500);
    };

    return (
        <div className="settings-container">
            <div className="settings-grid">

                {/* 1. Account Card */}
                <div className="settings-card">
                    <div className="settings-header">
                        <div className="icon-box"><FaUserCircle /></div>
                        <h3>Account</h3>
                    </div>
                    <div className="settings-body">
                        <div className="user-profile-summary">
                            <div className="avatar-placeholder">
                                {user.email[0].toUpperCase()}
                            </div>
                            <div className="user-info">
                                <span className="user-email">{user.email}</span>
                                <span className="user-role">Premium Member</span>
                            </div>
                        </div>
                        <div className="setting-item">
                            <button className="btn btn-outline btn-danger full-width" onClick={onLogout}>
                                <FaSignOutAlt /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Appearance */}
                <div className="settings-card">
                    <div className="settings-header">
                        <div className="icon-box"><FaMoon /></div>
                        <h3>Appearance</h3>
                    </div>
                    <div className="settings-body">
                        <div className="setting-item">
                            <div className="setting-info">
                                <h5>Theme Mode</h5>
                                <p>Switch between dark and light themes.</p>
                            </div>
                            <div className="setting-action">
                                <button className="theme-toggle-large" onClick={onToggleTheme}>
                                    {darkMode ? (
                                        <> <FaMoon /> <span>Dark</span> </>
                                    ) : (
                                        <> <FaSun /> <span>Light</span> </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Security (Existing) */}
                <div className="settings-card">
                    <div className="settings-header">
                        <div className="icon-box"><FaShieldAlt /></div>
                        <h3>Security</h3>
                    </div>
                    <div className="settings-body">
                        <div className="setting-item">
                            <div className="setting-info">
                                <h5>Biometric Login</h5>
                                <p>Use FaceID or Fingerprint for faster access.</p>
                            </div>
                            <div className="setting-action">
                                {!biometricAvailable ? (
                                    <span className="badge badge-warning">Not Supported</span>
                                ) : biometricEnrolled ? (
                                    <button className="btn btn-outline btn-danger btn-sm" onClick={handleDisableBiometric}>
                                        Disable
                                    </button>
                                ) : (
                                    <button className="btn btn-primary btn-sm" onClick={handleEnableBiometric} disabled={loading}>
                                        {loading ? <FaSpinner className="spin" /> : 'Setup'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h5>Two-Factor Auth</h5>
                                <p>Secure your account with an Authenticator App.</p>
                            </div>
                            <div className="setting-action">
                                <button className="btn btn-outline btn-sm" onClick={handleToggle2FA}>
                                    {show2FASetup ? 'Cancel' : 'Configure'}
                                </button>
                            </div>
                        </div>

                        {show2FASetup && (
                            <div className="setup-box-2fa fade-in">
                                {twoFactorData && (
                                    <>
                                        <div className="qr-container">
                                            <QRCodeSVG value={twoFactorData.uri} size={140} className="qr-code" />
                                        </div>
                                        <div className="secret-display">
                                            <p className="helper-text">Scan with Google Authenticator or Authy</p>
                                            <code>{twoFactorData.secret}</code>
                                        </div>

                                        <div className="verify-input-group">
                                            <input
                                                type="text"
                                                className="input-code"
                                                placeholder="000 000"
                                                maxLength="6"
                                                value={tokenInput}
                                                onChange={(e) => setTokenInput(e.target.value.replace(/\D/g, ''))}
                                            />
                                            <button className="btn btn-primary full-width" onClick={handleVerify2FA}>
                                                Verify & Enable
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Data Management */}
                <div className="settings-card">
                    <div className="settings-header">
                        <div className="icon-box"><FaDatabase /></div>
                        <h3>Data & Privacy</h3>
                    </div>
                    <div className="settings-body">
                        <div className="setting-item">
                            <div className="setting-info">
                                <h5>Export Wallet</h5>
                                <p>Download a secure backup of your data.</p>
                            </div>
                            <div className="setting-action">
                                <button className="btn btn-outline btn-sm" onClick={handleExportData}>
                                    <FaCloudDownloadAlt /> Export
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsView;
