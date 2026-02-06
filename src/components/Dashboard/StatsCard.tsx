import * as React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatsCard.css';

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    gradient: string;
    trend?: 'up' | 'down';
    onClick?: () => void;
}

export const StatsCard = ({ title, value, change, icon, gradient, trend, onClick }: StatsCardProps) => {
    return (
        <div
            className={`stats-card animate-scale-in hover-lift ${onClick ? 'interactive' : ''}`}
            onClick={onClick}
        >
            <div className="stats-card-header">
                <div className="stats-icon" style={{ background: gradient }}>
                    {icon}
                </div>
                <div className="stats-info">
                    <p className="stats-title">{title}</p>
                    <h3 className="stats-value">{value}</h3>
                </div>
            </div>

            {change !== undefined && (
                <div className="stats-footer">
                    <div className={`stats-change ${trend === 'up' ? 'positive' : 'negative'}`}>
                        {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span>{Math.abs(change)}%</span>
                    </div>
                    <span className="stats-period">vs mois dernier</span>
                </div>
            )}
        </div>
    );
};
