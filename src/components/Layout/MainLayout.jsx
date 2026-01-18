import { useState, useEffect } from 'react';
import { FaWallet, FaChartPie, FaCog, FaShieldAlt, FaSignOutAlt, FaSun, FaMoon, FaUserCircle } from 'react-icons/fa';
import MobileNav from '../MobileNav';
import './Layout.css';

const MainLayout = ({
    children,
    currentView,
    onChangeView,
    user,
    onLogout,
    darkMode,
    onToggleTheme,
    title
}) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { id: 'dashboard', label: 'Overview', icon: FaChartPie },
        { id: 'wallet', label: 'My Wallet', icon: FaWallet },
        { id: 'security', label: 'Security', icon: FaShieldAlt },
        { id: 'settings', label: 'Settings', icon: FaCog },
    ];

    return (
        <div className="layout-container">
            {/* Desktop Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="app-logo">
                        <FaWallet />
                    </div>
                    <span className="app-name">SecureWallet</span>
                </div>

                <nav className="nav-menu">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                            onClick={() => onChangeView(item.id)}
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
                    <button className="nav-item" onClick={onLogout}>
                        <FaSignOutAlt />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-area">
                <header className={`top-bar ${scrolled ? 'glass' : ''}`}>
                    <h1 className="page-title">{title || 'Dashboard'}</h1>

                    <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button
                            className="btn-icon"
                            onClick={onToggleTheme}
                            title="Toggle Theme"
                        >
                            {darkMode ? <FaSun /> : <FaMoon />}
                        </button>

                        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaUserCircle style={{ fontSize: '1.5rem', color: 'var(--text-light)' }} />
                            <span className="desktop-only" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                {user?.email?.split('@')[0]}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="view-content fade-in">
                    {children}
                </div>
            </main>

            {/* Mobile Navigation */}
            <MobileNav
                currentView={currentView}
                onToggleView={onChangeView}
            // onAddNew logic handled in specific views or via FAB passed down
            />
        </div>
    );
};

export default MainLayout;
