import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught Error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-app, #0f172a)',
                    color: 'var(--text-main, #f8fafc)',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <FaExclamationTriangle style={{ fontSize: '4rem', color: '#ef4444', marginBottom: '1rem' }} />
                    <h1>Something went wrong.</h1>
                    <p style={{ maxWidth: '600px', margin: '1rem 0', color: 'var(--text-muted, #94a3b8)' }}>
                        The application encountered an unexpected error.
                        We've logged this issue. Please try reloading.
                    </p>

                    {this.state.error && (
                        <div style={{
                            textAlign: 'left',
                            background: 'rgba(0,0,0,0.3)',
                            padding: '1rem',
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            marginBottom: '2rem',
                            maxWidth: '100%',
                            overflow: 'auto',
                            border: '1px solid rgba(255,100,100,0.2)'
                        }}>
                            <p style={{ color: '#fca5a5', fontWeight: 'bold' }}>{this.state.error.toString()}</p>
                            <pre style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </div>
                    )}

                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FaRedo /> Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
