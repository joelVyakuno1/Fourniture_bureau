import * as React from 'react';
import { Plus, ShoppingCart, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './QuickActions.css';

interface QuickAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
    gradient: string;
}

const actions: QuickAction[] = [
    {
        id: '1',
        label: 'Nouvelle demande',
        icon: <Plus size={20} />,
        path: '/demandes',
        gradient: 'var(--gradient-primary)'
    },
    {
        id: '2',
        label: 'Voir inventaire',
        icon: <Package size={20} />,
        path: '/inventaire',
        gradient: 'var(--gradient-success)'
    },
    {
        id: '3',
        label: 'Gérer stock',
        icon: <ShoppingCart size={20} />,
        path: '/stock',
        gradient: 'var(--gradient-info)'
    },
];

export const QuickActions = () => {
    const navigate = useNavigate();

    return (
        <div className="quick-actions">
            <h3 className="quick-actions-title">Actions rapides</h3>
            <div className="quick-actions-grid">
                {actions.map((action, index) => (
                    <button
                        key={action.id}
                        className="quick-action-btn animate-scale-in hover-lift"
                        style={{ animationDelay: `${index * 75}ms` }}
                        onClick={() => navigate(action.path)}
                    >
                        <div className="quick-action-icon" style={{ background: action.gradient }}>
                            {action.icon}
                        </div>
                        <span className="quick-action-label">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
