import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaRedo, FaLock } from 'react-icons/fa';
import { analyzePasswordStrength } from '../utils/passwordGenerator';
import { getCategoryById } from '../utils/categories';
import './PasswordHealth.css';

const PasswordHealth = ({ items, onEditItem }) => {
    const analysis = useMemo(() => {
        let totalPasswords = 0;
        let weakPasswords = 0;
        let reusedPasswords = new Map();
        let strengthDistribution = [
            { name: 'Very Weak', value: 0, color: '#ef4444' },
            { name: 'Weak', value: 0, color: '#f97316' },
            { name: 'Fair', value: 0, color: '#f59e0b' },
            { name: 'Good', value: 0, color: '#84cc16' },
            { name: 'Strong', value: 0, color: '#10b981' }
        ];
        let atRiskItems = [];

        items.forEach(item => {
            const category = getCategoryById(item.category);
            // Find password fields
            const passwordFields = category.fields.filter(f => f.type === 'password' || f.name.includes('password'));

            passwordFields.forEach(field => {
                const password = item[field.name];
                if (password) {
                    totalPasswords++;

                    // Strength analysis
                    const strength = analyzePasswordStrength(password);
                    strengthDistribution[strength.score].value++;

                    if (strength.score < 3) {
                        weakPasswords++;
                        atRiskItems.push({
                            id: item.id,
                            title: item[category.fields[0].name] || 'Untitled',
                            reason: 'Weak Password',
                            score: strength.score,
                            item: item
                        });
                    }

                    // Reused check
                    if (reusedPasswords.has(password)) {
                        reusedPasswords.get(password).push(item);
                    } else {
                        reusedPasswords.set(password, [item]);
                    }
                }
            });
        });

        // Process reused passwords
        reusedPasswords.forEach((itemsList, password) => {
            if (itemsList.length > 1) {
                itemsList.forEach(item => {
                    const category = getCategoryById(item.category);
                    // Avoid duplicates in atRisk if already there for weak password
                    if (!atRiskItems.find(i => i.id === item.id && i.reason === 'Reused Password')) {
                        atRiskItems.push({
                            id: item.id,
                            title: item[category.fields[0].name] || 'Untitled',
                            reason: 'Reused Password',
                            score: 0, // Lower priority or specific handling
                            item: item
                        });
                    }
                });
            }
        });

        const reusedCount = Array.from(reusedPasswords.values()).filter(list => list.length > 1).length;

        // Calculate health score (0-100)
        // Base 100, subtract for weak and reused
        let healthScore = 100;
        if (totalPasswords > 0) {
            healthScore -= (weakPasswords / totalPasswords) * 50;
            healthScore -= (reusedCount / totalPasswords) * 50;
        }
        healthScore = Math.max(0, Math.round(healthScore));

        return {
            totalPasswords,
            weakPasswords,
            reusedCount,
            strengthDistribution,
            atRiskItems,
            healthScore
        };
    }, [items]);

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="password-health-dashboard">
            <div className="health-header">
                <h2><FaShieldAlt /> Security Dashboard</h2>
                <div className="health-score" style={{ color: getScoreColor(analysis.healthScore) }}>
                    <div className="score-value">{analysis.healthScore}</div>
                    <div className="score-label">Health Score</div>
                </div>
            </div>

            <div className="health-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon"><FaLock /></div>
                    <div className="stat-info">
                        <div className="stat-value">{analysis.totalPasswords}</div>
                        <div className="stat-label">Total Passwords</div>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon"><FaExclamationTriangle /></div>
                    <div className="stat-info">
                        <div className="stat-value">{analysis.weakPasswords}</div>
                        <div className="stat-label">Weak Passwords</div>
                    </div>
                </div>
                <div className="stat-card danger">
                    <div className="stat-icon"><FaRedo /></div>
                    <div className="stat-info">
                        <div className="stat-value">{analysis.reusedCount}</div>
                        <div className="stat-label">Reused Passwords</div>
                    </div>
                </div>
            </div>

            <div className="health-content-row">
                <div className="chart-section">
                    <h3>Password Strength Distribution</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={analysis.strengthDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {analysis.strengthDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="risk-list-section">
                    <h3>Action Required ({analysis.atRiskItems.length})</h3>
                    {analysis.atRiskItems.length === 0 ? (
                        <div className="all-good-state">
                            <FaCheckCircle className="success-icon" />
                            <p>No security issues detected!</p>
                        </div>
                    ) : (
                        <div className="risk-list">
                            {analysis.atRiskItems.map((risk, idx) => (
                                <div key={idx} className="risk-item">
                                    <div className="risk-info">
                                        <span className="risk-title">{risk.title}</span>
                                        <span className={`risk-reason ${risk.reason.toLowerCase().includes('weak') ? 'warning' : 'danger'}`}>
                                            {risk.reason}
                                        </span>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-outline"
                                        onClick={() => onEditItem(risk.item)}
                                    >
                                        Fix
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PasswordHealth;
