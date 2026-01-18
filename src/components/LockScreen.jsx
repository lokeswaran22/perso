import { useState, useEffect } from 'react';
import { FaLock, FaFingerprint, FaArrowRight, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { verifyBiometric, checkBiometricAvailability } from '../services/biometricService';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import './LockScreen.css';

const LockScreen = ({ user, onUnlock, onLogout }) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);

    useEffect(() => {
        checkBiometricAvailability().then(avail => {
            const isEnrolled = localStorage.getItem(`biometric_enrolled_${user.uid}`) === 'true';
            setBiometricAvailable(avail && isEnrolled);

            // Auto-prompt for biometrics if available
            if (avail && isEnrolled) {
                // Small delay/user interaction usually required, but we can try
            }
        });
    }, [user.uid]);

    const handleUnlock = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);

        try {
            // Re-authenticate to ensure password is correct
            await signInWithEmailAndPassword(auth, user.email, password);
            onUnlock();
            toast.success('Waller Unlocked');
        } catch (error) {
            console.error(error);
            toast.error('Incorrect password');
        } finally {
            setLoading(false);
        }
    };

    const handleBiometricUnlock = async () => {
        try {
            const verified = await verifyBiometric(user.uid);
            if (verified) {
                onUnlock();
                toast.success('Wallet Unlocked with Biometrics');
            }
        } catch (error) {
            console.error(error);
            toast.error('Biometric verification failed');
        }
    };

    return (
        <div className="lock-screen-overlay">
            <div className="lock-card glass">
                <div className="lock-icon-pulse">
                    <FaLock />
                </div>
                <h2>Vault Locked</h2>
                <p className="user-email">{user.email}</p>

                <form onSubmit={handleUnlock} className="lock-form">
                    <div className="input-group">
                        <input
                            type="password"
                            className="input lock-input"
                            placeholder="Master Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <FaArrowRight />
                        </button>
                    </div>
                </form>

                {biometricAvailable && (
                    <button
                        className="btn btn-outline biometric-btn"
                        onClick={handleBiometricUnlock}
                    >
                        <FaFingerprint /> Unlock with Biometrics
                    </button>
                )}

                <div className="lock-footer">
                    <button className="text-btn" onClick={onLogout}>
                        <FaSignOutAlt /> Log out completely
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LockScreen;
