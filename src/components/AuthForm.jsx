import { useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { FaGoogle, FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './AuthForm.css';

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const getPasswordStrength = (pass) => {
        if (pass.length < 6) return { strength: 'weak', color: '#ef4444', text: 'Weak' };
        if (pass.length < 10) return { strength: 'medium', color: '#f59e0b', text: 'Medium' };
        if (pass.length >= 10 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) {
            return { strength: 'strong', color: '#10b981', text: 'Strong' };
        }
        return { strength: 'medium', color: '#f59e0b', text: 'Medium' };
    };

    const passwordStrength = !isLogin ? getPasswordStrength(password) : null;

    const handleEmailAuth = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!isLogin && password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                toast.success('Welcome back!');
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                toast.success('Account created successfully!');
            }
        } catch (error) {
            console.error('Auth error:', error);

            switch (error.code) {
                case 'auth/email-already-in-use':
                    toast.error('Email already in use');
                    break;
                case 'auth/invalid-email':
                    toast.error('Invalid email address');
                    break;
                case 'auth/user-not-found':
                    toast.error('User not found');
                    break;
                case 'auth/wrong-password':
                    toast.error('Incorrect password');
                    break;
                case 'auth/weak-password':
                    toast.error('Password is too weak');
                    break;
                default:
                    toast.error('Authentication failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        const provider = new GoogleAuthProvider();

        try {
            await signInWithPopup(auth, provider);
            toast.success('Welcome!');
        } catch (error) {
            console.error('Google auth error:', error);
            toast.error('Google sign-in failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="auth-gradient-1"></div>
                <div className="auth-gradient-2"></div>
                <div className="auth-gradient-3"></div>
            </div>

            <div className="auth-card glass">
                <div className="auth-header">
                    <div className="auth-icon">
                        <FaLock />
                    </div>
                    <h1 className="auth-title gradient-text">Personal Wallet</h1>
                    <p className="auth-subtitle">
                        {isLogin ? 'Welcome back! Sign in to access your wallet' : 'Create an account to get started'}
                    </p>
                </div>

                <form onSubmit={handleEmailAuth} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            <FaEnvelope /> Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            <FaLock /> Password
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                className="input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {!isLogin && password && (
                            <div className="password-strength">
                                <div className="password-strength-bar">
                                    <div
                                        className="password-strength-fill"
                                        style={{
                                            width: password.length < 6 ? '33%' : password.length < 10 ? '66%' : '100%',
                                            background: passwordStrength.color
                                        }}
                                    ></div>
                                </div>
                                <span style={{ color: passwordStrength.color }}>{passwordStrength.text}</span>
                            </div>
                        )}
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                <FaLock /> Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                className="input"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                        {loading ? (
                            <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                        ) : (
                            isLogin ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>or</span>
                </div>

                <button
                    type="button"
                    className="btn btn-secondary google-btn"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                >
                    <FaGoogle /> Continue with Google
                </button>

                <div className="auth-footer">
                    <p>
                        {isLogin ? "Don't have an account?" : 'Already have an account?'}
                        {' '}
                        <button
                            type="button"
                            className="auth-toggle"
                            onClick={() => setIsLogin(!isLogin)}
                            disabled={loading}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
