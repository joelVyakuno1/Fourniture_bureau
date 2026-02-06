import * as React from 'react';
import { Package, TrendingUp, AlertTriangle, Truck } from 'lucide-react';
import { StockDashboard } from '../components/StockDashboard';
import { useMockData } from '../context/MockDataContext';
import './StockManagement.css';

export const StockManagement = () => {
    const { requests, deliverRequest, products } = useMockData();

    // Filter for approved requests only
    // StockDashboard expects a specific format, we might need to adapt if TS complains, 
    // but our MockData uses similar Interface. 
    const approvedRequests = requests.filter(r => r.status === 'Approved');

    const handleDeliver = (requestId: string) => {
        deliverRequest(requestId);
        alert('✅ Livraison effectuée avec succès ! Le stock a été mis à jour.');
    };

    // Live Stats
    const totalArticles = products.length;
    const lowStock = products.filter(p => p.qtyPhysical < p.qtyMini).length;
    // A dummy value calculation for demo
    const stockValue = products.reduce((acc, p) => acc + (p.qtyPhysical * 2.5), 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

    return (
        <div className="stock-management-page">
            <div className="page-header">
                <div className="header-content">
                    <div className="header-icon">
                        <Package size={32} />
                    </div>
                    <div>
                        <h1 className="page-title">Gestion de stock</h1>
                        <p className="page-subtitle">Gérez les livraisons et le réapprovisionnement</p>
                    </div>
                </div>
            </div>

            <div className="stock-stats-grid">
                <div className="stat-card animate-scale-in">
                    <div className="stat-icon" style={{ background: 'var(--gradient-primary)' }}><Package size={24} /></div>
                    <div className="stat-content"><p className="stat-label">Total articles</p><h3 className="stat-value">{totalArticles}</h3></div>
                </div>
                <div className="stat-card animate-scale-in" style={{ animationDelay: '75ms' }}>
                    <div className="stat-icon" style={{ background: 'var(--gradient-success)' }}><TrendingUp size={24} /></div>
                    <div className="stat-content"><p className="stat-label">Valeur stock (est.)</p><h3 className="stat-value">{stockValue}</h3></div>
                </div>
                <div className="stat-card animate-scale-in" style={{ animationDelay: '150ms' }}>
                    <div className="stat-icon" style={{ background: 'var(--gradient-warning)' }}><AlertTriangle size={24} /></div>
                    <div className="stat-content"><p className="stat-label">Alertes stock</p><h3 className="stat-value">{lowStock}</h3></div>
                </div>
                <div className="stat-card animate-scale-in" style={{ animationDelay: '225ms' }}>
                    <div className="stat-icon" style={{ background: 'var(--gradient-info)' }}><Truck size={24} /></div>
                    <div className="stat-content"><p className="stat-label">À livrer</p><h3 className="stat-value">{approvedRequests.length}</h3></div>
                </div>
            </div>

            <div className="stock-content">
                <StockDashboard requests={approvedRequests} onDeliver={handleDeliver} />
            </div>
        </div>
    );
};
