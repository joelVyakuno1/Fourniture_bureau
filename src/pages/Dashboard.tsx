import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatsCard } from '../components/Dashboard/StatsCard';
import { ActivityFeed } from '../components/Dashboard/ActivityFeed';
import { QuickActions } from '../components/Dashboard/QuickActions';
import { useMockData } from '../context/MockDataContext';
import './Dashboard.css';

const trendData = [
    { name: 'Jan', demandes: 45, livraisons: 40 },
    { name: 'Fév', demandes: 52, livraisons: 48 },
    { name: 'Mar', demandes: 61, livraisons: 55 },
    { name: 'Avr', demandes: 58, livraisons: 52 },
    { name: 'Mai', demandes: 70, livraisons: 65 },
    { name: 'Juin', demandes: 85, livraisons: 78 },
];

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#11998e', '#d13438'];

export const Dashboard = () => {
    const navigate = useNavigate();
    const { products, requests, activities } = useMockData();

    // Calculate live stats
    const totalStock = products.reduce((acc, p) => acc + p.qtyPhysical, 0);
    const pendingRequests = requests.filter(r => r.status === 'Pending').length;
    const lowStockAlerts = products.filter(p => p.qtyPhysical <= p.qtyMini).length;
    const deliveredThisMonth = requests.filter(r => r.status === 'Delivered').length;

    // Derive categories for Pie Chart
    const categoryMap = new Map<string, number>();
    products.forEach(p => {
        const current = categoryMap.get(p.category) || 0;
        categoryMap.set(p.category, current + 1);
    });
    const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Tableau de bord</h1>
                    <p className="dashboard-subtitle">Vue d'ensemble de votre gestion de fournitures</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <StatsCard
                    title="Articles en stock"
                    value={totalStock.toLocaleString()}
                    change={12}
                    trend="up"
                    icon={<Package size={24} />}
                    gradient="var(--gradient-primary)"
                    onClick={() => navigate('/inventaire')}
                />
                <StatsCard
                    title="Demandes en cours"
                    value={pendingRequests.toString()}
                    change={-5}
                    trend={pendingRequests > 5 ? "up" : "down"}
                    icon={<ShoppingCart size={24} />}
                    gradient="var(--gradient-info)"
                    onClick={() => navigate('/demandes')}
                />
                <StatsCard
                    title="Alertes de stock"
                    value={lowStockAlerts.toString()}
                    change={15}
                    trend={lowStockAlerts > 0 ? "up" : "down"}
                    icon={<AlertTriangle size={24} />}
                    gradient="var(--gradient-warning)"
                    onClick={() => navigate('/stock')}
                />
                <StatsCard
                    title="Livraisons ce mois"
                    value={deliveredThisMonth.toString()}
                    change={23}
                    trend="up"
                    icon={<TrendingUp size={24} />}
                    gradient="var(--gradient-success)"
                    onClick={() => navigate('/approbations')}
                />
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                <div className="chart-card animate-fade-in">
                    <div className="chart-header">
                        <h3>Tendances des demandes (Simulé)</h3>
                        <span className="chart-period">6 derniers mois</span>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorDemandes" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorLivraisons" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#11998e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#11998e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis dataKey="name" stroke="var(--color-text-tertiary)" />
                            <YAxis stroke="var(--color-text-tertiary)" />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            />
                            <Area type="monotone" dataKey="demandes" stroke="#667eea" fillOpacity={1} fill="url(#colorDemandes)" />
                            <Area type="monotone" dataKey="livraisons" stroke="#11998e" fillOpacity={1} fill="url(#colorLivraisons)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <div className="chart-header">
                        <h3>Répartition par catégorie</h3>
                        <span className="chart-period">Ce mois</span>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="dashboard-bottom">
                <div className="dashboard-activity">
                    <ActivityFeed activities={activities.slice(0, 5)} />
                </div>
                <div className="dashboard-actions">
                    <QuickActions />
                </div>
            </div>
        </div>
    );
};
