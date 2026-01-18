import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FaWallet, FaStar, FaShieldAlt, FaPlus, FaSearch, FaArrowRight } from 'react-icons/fa';
import './Dashboard.css';

const DashboardView = ({ items, onNavigate }) => {
    const stats = useMemo(() => {
        const total = items.length;
        const favorites = items.filter(i => i.isFavorite).length;
        const weakPasswords = items.filter(i => i.category === 'passwords' && (!i.password || i.password.length < 8)).length;

        const categoryData = items.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {});

        const chartData = Object.entries(categoryData)
            .map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
                value
            }))
            .sort((a, b) => b.value - a.value);

        return { total, favorites, weakPasswords, chartData };
    }, [items]);

    const COLORS = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6'];

    return (
        <div className="dashboard-container">
            {/* Stats Row */}
            <div className="stats-grid">
                <div className="stat-card" onClick={() => onNavigate('wallet')}>
                    <div className="stat-content">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Items</span>
                    </div>
                    <div className="stat-icon-wrapper" style={{ color: '#4f46e5', background: '#eef2ff' }}>
                        <FaWallet />
                    </div>
                </div>

                <div className="stat-card" onClick={() => onNavigate('wallet')}>
                    <div className="stat-content">
                        <span className="stat-value">{stats.favorites}</span>
                        <span className="stat-label">Favorites</span>
                    </div>
                    <div className="stat-icon-wrapper" style={{ color: '#f59e0b', background: '#fffbeb' }}>
                        <FaStar />
                    </div>
                </div>

                <div className="stat-card" onClick={() => onNavigate('security')}>
                    <div className="stat-content">
                        <span className="stat-value">{stats.weakPasswords}</span>
                        <span className="stat-label">Security Alerts</span>
                    </div>
                    <div className="stat-icon-wrapper" style={{ color: '#ef4444', background: '#fef2f2' }}>
                        <FaShieldAlt />
                    </div>
                </div>
            </div>

            {/* Dashboard Main Content */}
            <div className="dashboard-grid">
                {/* Chart */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3 className="card-title">Storage Breakdown</h3>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        {stats.chartData.length > 0 ? (
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={stats.chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--bg-surface)',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-color)',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                        }}
                                        itemStyle={{ color: 'var(--text-main)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-chart" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                No data available
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                        {stats.chartData.slice(0, 4).map((entry, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[index] }}></div>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3 className="card-title">Quick Actions</h3>
                    </div>
                    <div className="action-list">
                        <button className="action-btn" onClick={() => onNavigate('add-new')}>
                            <FaPlus />
                            <span>Add New Item</span>
                            <FaArrowRight style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.5 }} />
                        </button>
                        <button className="action-btn" onClick={() => onNavigate('wallet')}>
                            <FaSearch />
                            <span>Search Wallet</span>
                            <FaArrowRight style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.5 }} />
                        </button>
                        <button className="action-btn" onClick={() => onNavigate('security')}>
                            <FaShieldAlt />
                            <span>Security Checkup</span>
                            <FaArrowRight style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.5 }} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
