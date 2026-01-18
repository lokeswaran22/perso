import { FaWallet, FaMoon, FaSun, FaPlus, FaSignOutAlt, FaFileExport, FaShieldAlt, FaChartPie, FaCog } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { toast } from 'react-toastify';
import SyncStatus from './SyncStatus';
import './Header.css';

const Header = ({ darkMode, onToggleDarkMode, onAddNew, user, onExport, currentView, onToggleView, onOpenSettings }) => {
    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
        }
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-brand">
                    <div className="header-logo">
                        <FaWallet />
                    </div>
                    <div className="header-title">
                        <h1 className="gradient-text">RSLH</h1>
                        <p className="header-subtitle"> - Perso</p>
                    </div>
                </div>

                <div className="header-actions">
                    <SyncStatus />
                    <button
                        className={`btn ${currentView === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => onToggleView('analytics')}
                        title="Analytics Dashboard"
                    >
                        <FaChartPie /> Analytics
                    </button>
                    <button
                        className={`btn ${currentView === 'security' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => onToggleView(currentView === 'security' ? 'wallet' : 'security')}
                        title="Security Dashboard"
                    >
                        <FaShieldAlt /> Security
                    </button>

                    <div className="header-export-group">
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={() => onExport('json')}
                            title="Backup Database"
                        >
                            <FaFileExport /> JSON
                        </button>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={() => onExport('csv')}
                            title="Export to CSV"
                        >
                            <FaFileExport /> CSV
                        </button>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={onAddNew}
                        title="Add new item"
                    >
                        <FaPlus /> Add New
                    </button>

                    <button
                        className="btn-icon header-theme-toggle"
                        onClick={onToggleDarkMode}
                        title={darkMode ? 'Light mode' : 'Dark mode'}
                    >
                        {darkMode ? <FaSun /> : <FaMoon />}
                    </button>

                    {user && (
                        <div className="header-user">
                            <div className="header-user-info">
                                <span className="header-user-email">{user.email}</span>
                            </div>
                            <button
                                className="btn-icon"
                                onClick={onOpenSettings}
                                title="Settings"
                            >
                                <FaCog />
                            </button>
                            <button
                                className="btn-icon"
                                onClick={handleLogout}
                                title="Logout"
                            >
                                <FaSignOutAlt />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
