import { useState, useEffect } from 'react';
import { FaChartPie, FaChartBar, FaClock, FaFire } from 'react-icons/fa';
import { getStorageInfo } from '../services/localStorageService';
import './Analytics.css';

const Analytics = ({ user, files }) => {
    const [stats, setStats] = useState({
        totalFiles: 0,
        totalSize: 0,
        byType: {},
        recentActivity: [],
        storageUsed: 0,
        percentUsed: 0
    });

    useEffect(() => {
        if (!user || !files) return;

        // Calculate statistics
        const storageInfo = getStorageInfo(user.uid);

        const byType = files.reduce((acc, file) => {
            const category = getFileCategory(file.type);
            if (!acc[category]) {
                acc[category] = { count: 0, size: 0 };
            }
            acc[category].count++;
            acc[category].size += file.size || 0;
            return acc;
        }, {});

        const recentActivity = files
            .slice(0, 5)
            .map(f => ({
                name: f.name,
                action: 'uploaded',
                time: f.createdAt
            }));

        setStats({
            totalFiles: files.length,
            totalSize: storageInfo.totalSize,
            byType,
            recentActivity,
            storageUsed: storageInfo.storageUsed,
            percentUsed: storageInfo.percentUsed
        });
    }, [user, files]);

    const getFileCategory = (type) => {
        if (type.startsWith('image/')) return 'Images';
        if (type.startsWith('video/')) return 'Videos';
        if (type.includes('pdf')) return 'Documents';
        if (type.includes('text')) return 'Text Files';
        return 'Other';
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp.seconds * 1000);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Images': '#4CAF50',
            'Videos': '#FF9800',
            'Documents': '#F44336',
            'Text Files': '#2196F3',
            'Other': '#9E9E9E'
        };
        return colors[category] || '#9E9E9E';
    };

    return (
        <div className="analytics-dashboard">
            <h2 className="analytics-title">
                <FaChartPie /> Analytics Dashboard
            </h2>

            {/* Quick Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <FaChartBar />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.totalFiles}</h3>
                        <p>Total Files</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        <FaFire />
                    </div>
                    <div className="stat-info">
                        <h3>{formatBytes(stats.totalSize)}</h3>
                        <p>Total Size</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        <FaClock />
                    </div>
                    <div className="stat-info">
                        <h3>{Math.round(stats.percentUsed)}%</h3>
                        <p>Storage Used</p>
                    </div>
                </div>
            </div>

            {/* File Type Distribution */}
            <div className="analytics-section">
                <h3>File Distribution</h3>
                <div className="file-type-bars">
                    {Object.entries(stats.byType).map(([category, data]) => {
                        const percentage = (data.count / stats.totalFiles) * 100;
                        return (
                            <div key={category} className="type-bar-item">
                                <div className="type-bar-header">
                                    <span className="type-name">{category}</span>
                                    <span className="type-count">{data.count} files ({formatBytes(data.size)})</span>
                                </div>
                                <div className="type-bar-container">
                                    <div
                                        className="type-bar-fill"
                                        style={{
                                            width: `${percentage}%`,
                                            background: getCategoryColor(category)
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="analytics-section">
                <h3>Recent Activity</h3>
                <div className="activity-timeline">
                    {stats.recentActivity.map((activity, index) => (
                        <div key={index} className="activity-item">
                            <div className="activity-dot" />
                            <div className="activity-content">
                                <p className="activity-text">
                                    <strong>{activity.name}</strong> was {activity.action}
                                </p>
                                <span className="activity-time">{formatTime(activity.time)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
