import * as React from 'react';
import { Search, Bell, User, Moon, Sun, Settings, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import {
    Popover,
    PopoverTrigger,
    PopoverSurface,
    Menu,
    MenuTrigger,
    MenuList,
    MenuItem,
    MenuPopover,
    Divider,
    Text
} from '@fluentui/react-components';
import './TopBar.css';

interface TopBarProps {
    title?: string;
    breadcrumbs?: { label: string; path?: string }[];
}

const routeTitles: Record<string, string> = {
    '/': 'Tableau de bord',
    '/demandes': 'Nouvelle Demande',
    '/approbations': 'Approbations',
    '/inventaire': 'Inventaire',
    '/stock': 'Gestion de Stock'
};

export const TopBar = ({ title, breadcrumbs }: TopBarProps) => {
    const location = useLocation();
    const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
    const [notifications] = React.useState(3);
    const [searchQuery, setSearchQuery] = React.useState('');

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            console.log('Searching for:', searchQuery);
            // Implement actual search logic here
        }
    };

    const currentTitle = title || routeTitles[location.pathname] || 'Tableau de bord';

    return (
        <header className="topbar">
            <div className="topbar-left">
                {breadcrumbs && breadcrumbs.length > 0 ? (
                    <nav className="breadcrumbs">
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && <span className="breadcrumb-separator">/</span>}
                                <span className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}>
                                    {crumb.label}
                                </span>
                            </React.Fragment>
                        ))}
                    </nav>
                ) : (
                    <h1 className="topbar-title">{currentTitle}</h1>
                )}
            </div>

            <div className="topbar-right">
                <div className="search-container">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>

                <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <Popover>
                    <PopoverTrigger disableButtonEnhancement>
                        <button className="icon-btn notification-btn" aria-label="Notifications">
                            <Bell size={20} />
                            {notifications > 0 && (
                                <span className="notification-badge">{notifications}</span>
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverSurface aria-label="Notifications" style={{ width: '300px', padding: '16px' }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>Notifications</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="notification-item">
                                <Text weight="semibold">Nouvelle demande</Text>
                                <Text size={200} style={{ display: 'block', color: 'var(--colorNeutralForeground2)' }}>Jean DuPont a soumis une demande.</Text>
                            </div>
                            <Divider />
                            <div className="notification-item">
                                <Text weight="semibold">Stock faible</Text>
                                <Text size={200} style={{ display: 'block', color: 'var(--colorNeutralForeground2)' }}>Papier A4 est presque épuisé.</Text>
                            </div>
                            <Divider />
                            <div className="notification-item">
                                <Text weight="semibold">Approbation requise</Text>
                                <Text size={200} style={{ display: 'block', color: 'var(--colorNeutralForeground2)' }}>Demande #1234 en attente.</Text>
                            </div>
                        </div>
                    </PopoverSurface>
                </Popover>

                <Menu>
                    <MenuTrigger disableButtonEnhancement>
                        <button className="user-btn">
                            <User size={20} />
                            <span className="user-name">Utilisateur</span>
                        </button>
                    </MenuTrigger>
                    <MenuPopover>
                        <MenuList>
                            <MenuItem icon={<User size={16} />}>Mon profil</MenuItem>
                            <MenuItem icon={<Settings size={16} />}>Paramètres</MenuItem>
                            <Divider />
                            <MenuItem icon={<LogOut size={16} />}>Déconnexion</MenuItem>
                        </MenuList>
                    </MenuPopover>
                </Menu>
            </div>
        </header>
    );
};
