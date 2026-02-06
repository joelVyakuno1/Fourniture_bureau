import * as React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    CheckSquare,
    BarChart3,
    Settings,
    Bell,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import './Sidebar.css';

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { path: '/', label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
    { path: '/demandes', label: 'Nouvelle demande', icon: <ShoppingCart size={20} /> },
    { path: '/approbations', label: 'Approbations', icon: <CheckSquare size={20} /> },
    { path: '/inventaire', label: 'Inventaire', icon: <Package size={20} /> },
    { path: '/stock', label: 'Gestion stock', icon: <BarChart3 size={20} /> },
];

export const Sidebar = () => {
    const [collapsed, setCollapsed] = React.useState(false);

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    {collapsed ? (
                        <div className="logo-icon-container">
                            <img src="/logo.png" alt="Brasimba Logo" className="logo-img-small" />
                        </div>
                    ) : (
                        <img src="/logo.png" alt="Brasimba Logo" className="logo-img-full" />
                    )}
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        title={collapsed ? item.label : ''}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {!collapsed && <span className="nav-label">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <NavLink to="/parametres" className="nav-item" title={collapsed ? 'Paramètres' : ''}>
                    <span className="nav-icon"><Settings size={20} /></span>
                    {!collapsed && <span className="nav-label">Paramètres</span>}
                </NavLink>

                <button
                    className="collapse-btn"
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
        </aside>
    );
};
