import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaShieldAlt } from 'react-icons/fa';

// Components
import AuthForm from './components/AuthForm';
import DriveView from './components/DriveView';
import ErrorBoundary from './components/ErrorBoundary';

import './index.css';
import './App.css';

function App() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(() => {
        return JSON.parse(localStorage.getItem('darkMode') || 'true');
    });

    // Initialize Auth
    useEffect(() => {
        if (!auth) {
            console.error('Firebase Auth is not initialized. Check your environment variables.');
            // Dump partial config to help debug (don't log full keys in production if possible, but valid check is needed)
            console.log('Environment Debug:', {
                hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
                authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
                projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
            });
            setAuthLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Theme Effect
    useEffect(() => {
        const root = document.documentElement;
        if (!darkMode) {
            root.setAttribute('data-theme', 'light');
        } else {
            root.removeAttribute('data-theme');
        }
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    const handleLogout = () => signOut(auth);

    if (authLoading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
            </div>
        );
    }

}

if (!auth) {
    return (
        <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
            <h2>Configuration Error</h2>
            <p>Firebase configuration is missing or invalid.</p>
            <p>Please check the console for more details.</p>
            <div style={{ textAlign: 'left', background: '#333', padding: '15px', borderRadius: '5px' }}>
                <p><strong>Debug Info:</strong></p>
                <p>API Key Present: {import.meta.env.VITE_FIREBASE_API_KEY ? 'Yes' : 'No'}</p>
                <p>Project ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Missing'}</p>
            </div>
        </div>
    );
}

if (!user) {
    return (
        <ErrorBoundary>
            <AuthForm />
            <ToastContainer theme={darkMode ? 'dark' : 'light'} />
        </ErrorBoundary>
    );
}

return (
    <ErrorBoundary>
        <div className="app-container">
            {/* Simple Header */}
            <header className="app-header">
                <div className="header-content">
                    <h1>
                        <FaShieldAlt className="app-logo-icon" />
                        <span className="brand-name">RSLH</span>
                        <span className="brand-divider">|</span>
                        <span className="brand-subtitle">Perso</span>
                    </h1>
                    <div className="header-actions">
                        {user && (
                            <div className="user-info" title={user.email}>
                                <div className="user-avatar">
                                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="user-email">{user.email}</span>
                            </div>
                        )}
                        <button
                            className="btn-icon"
                            onClick={() => setDarkMode(!darkMode)}
                            title={darkMode ? 'Light mode' : 'Dark mode'}
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                        <button className="btn btn-secondary" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Drive View */}
            <main className="app-main">
                <DriveView user={user} />
            </main>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                theme={darkMode ? 'dark' : 'light'}
            />
        </div>
    </ErrorBoundary>
);
}

export default App;
