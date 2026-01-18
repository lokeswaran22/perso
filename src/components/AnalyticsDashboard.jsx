import { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { FaChartPie, FaChartLine, FaShieldAlt, FaHistory, FaClock } from 'react-icons/fa';
import { getCategoryById } from '../utils/categories';
import { analyzePasswordStrength } from '../utils/passwordGenerator';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = ({ items, auditLogs = [] }) => {
    // 1. Category Distribution
    const categoryData = useMemo(() => {
        const counts = {};
        items.forEach(item => {
            const cat = getCategoryById(item.category);
            if (cat) {
                counts[cat.label] = (counts[cat.label] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [items]);

    // 2. Security Score Trend (Mocked for now as we don't track history of scores yet)
    // In a real app, we'd calculate this from historical snapshots
    const securityTrendData = [
        { name: 'Week 1', score: 65 },
        { name: 'Week 2', score: 72 },
        { name: 'Week 3', score: 78 },
        { name: 'Week 4', score: 85 },
    ];

    // 3. Password Strength Distribution
    const strengthData = useMemo(() => {
        const distribution = [0, 0, 0, 0, 0]; // 0-4 scores
        items.forEach(item => {
            if (item.category === 'passwords' && item.password) {
                const result = analyzePasswordStrength(item.password);
                distribution[result.score]++;
            }
        });

        const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];

        return labels.map((name, index) => ({
            name,
            value: distribution[index],
            color: colors[index]
        })).filter(d => d.value > 0);
    }, [items]);

    // 4. Activity Summary (from Audit Logs)
    // const recentActivity = ... (passed as prop or fetched)

    const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4'];

    return (
        <div className="analytics-dashboard">
            <header className="dashboard-header">
                <h2><FaChartPie /> Analytics & Insights</h2>
                <p> visualize your vault usage and security metrics</p>
            </header>

            <div className="analytics-grid">
                {/* Key Metrics Cards */}
                <div className="metric-card">
                    <div className="metric-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#6366f1' }}>
                        <FaShieldAlt />
                    </div>
                    <div className="metric-info">
                        <h3>Total Items</h3>
                        <div className="metric-value">{items.length}</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }}>
                        <FaHistory />
                    </div>
                    <div className="metric-info">
                        <h3>Last Login</h3>
                        <div className="metric-value text-sm">
                            {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
                        <FaClock />
                    </div>
                    <div className="metric-info">
                        <h3>Avg. Password Age</h3>
                        <div className="metric-value">45 days</div>
                    </div>
                </div>
            </div>

            <div className="charts-container">
                {/* Category Distribution Chart */}
                <div className="chart-card">
                    <h3>Item Distribution by Category</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    paddingAngle={5}
                                    innerRadius={60}
                                    outerRadius={80}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="chart-legend">
                        {categoryData.map((entry, index) => (
                            <div key={index} className="legend-item">
                                <span className="legend-color" style={{ background: COLORS[index % COLORS.length] }}></span>
                                <span className="legend-label">{entry.name} ({entry.value})</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Password Strength Bar Chart */}
                <div className="chart-card">
                    <h3>Password Strength Distribution</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={strengthData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--text-tertiary)" />
                                <YAxis stroke="var(--text-tertiary)" />
                                <RechartsTooltip
                                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {strengthData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
