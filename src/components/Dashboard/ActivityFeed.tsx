import * as React from 'react';
import { Clock, Package, CheckCircle, XCircle } from 'lucide-react';
import { Activity } from '../../context/MockDataContext';
import './ActivityFeed.css';

const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
        case 'request': return <Package size={16} />;
        case 'approval': return <CheckCircle size={16} />;
        case 'delivery': return <Package size={16} />;
        case 'rejection': return <XCircle size={16} />;
        default: return <Clock size={16} />;
    }
};

const getActivityColor = (type: Activity['type']) => {
    switch (type) {
        case 'request': return 'var(--color-info)';
        case 'approval': return 'var(--color-success)';
        case 'delivery': return 'var(--color-primary)';
        case 'rejection': return 'var(--color-danger)';
        default: return 'var(--color-text-tertiary)';
    }
};

interface ActivityFeedProps {
    activities: Activity[];
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
    return (
        <div className="activity-feed">
            <div className="activity-header">
                <h3>Activité récente</h3>
                <Clock size={18} className="text-secondary" />
            </div>

            <div className="activity-list">
                {activities.map((activity, index) => (
                    <div
                        key={activity.id}
                        className="activity-item animate-slide-right"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div
                            className="activity-icon"
                            style={{ background: getActivityColor(activity.type) }}
                        >
                            {getActivityIcon(activity.type)}
                        </div>
                        <div className="activity-content">
                            <p className="activity-message">
                                <strong>{activity.user}</strong> {activity.message}
                            </p>
                            <span className="activity-time">{activity.timestamp}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
