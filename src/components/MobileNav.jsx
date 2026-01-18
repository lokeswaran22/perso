import { FaWallet, FaChartPie, FaShieldAlt, FaCog, FaPlus } from 'react-icons/fa';
import './MobileNav.css';

const MobileNav = ({ currentView, onToggleView, onAddNew, onOpenSettings }) => {
    return (
        <nav className="mobile-nav">
            <button
                className={`mobile-nav-item ${currentView === 'wallet' && !onOpenSettings ? 'active' : ''}`}
                onClick={() => onToggleView('wallet')}
            >
                <FaWallet />
                <span>Wallet</span>
            </button>

            <button
                className={`mobile-nav-item ${currentView === 'analytics' ? 'active' : ''}`}
                onClick={() => onToggleView('analytics')}
            >
                <FaChartPie />
                <span>Analytics</span>
            </button>

            <div className="mobile-nav-fab-wrapper">
                <button className="mobile-nav-fab" onClick={onAddNew} aria-label="Add Item">
                    <FaPlus />
                </button>
            </div>

            <button
                className={`mobile-nav-item ${currentView === 'security' ? 'active' : ''}`}
                onClick={() => onToggleView('security')}
            >
                <FaShieldAlt />
                <span>Security</span>
            </button>

            <button
                className="mobile-nav-item"
                onClick={onOpenSettings}
            >
                <FaCog />
                <span>Settings</span>
            </button>
        </nav>
    );
};

export default MobileNav;
