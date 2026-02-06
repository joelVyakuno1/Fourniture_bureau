import * as React from 'react';
import { ShoppingCart, AlertCircle } from 'lucide-react';
import { InlineDemandTable } from '../components/InlineDemandTable';
import { useMockData } from '../context/MockDataContext';
import './NewRequest.css';

export const NewRequest = () => {
    const { products, createRequest, isLoading } = useMockData();
    const [lines, setLines] = React.useState<any[]>([]);
    const [motif, setMotif] = React.useState('');

    const totalQty = lines.reduce((acc, l) => acc + (l.qty || 0), 0);
    const hasLowStock = lines.some(line => {
        const product = products.find(p => p.id === line.productId);
        return product && line.qty > product.qtyPhysical;
    });

    const handleSend = async () => {
        if (totalQty === 0) return;

        // Simulate user ID
        const userId = "utilisateur.test@company.com";

        // Create actual request with motif
        createRequest(userId, lines, motif);

        // Reset handled potentially by a redirect or toast, keeping simple here
        alert('✅ Demande envoyée avec succès ! Vous pouvez la voir dans "Approbations".');
        setLines([]);
        setMotif('');
    };

    return (
        <div className="new-request-page">
            <div className="page-header">
                <div className="header-content">
                    <div className="header-icon">
                        <ShoppingCart size={32} />
                    </div>
                    <div>
                        <h1 className="page-title">Nouvelle demande</h1>
                        <p className="page-subtitle">Créez une demande de fournitures de bureau</p>
                    </div>
                </div>
            </div>

            <div className="request-container">
                <div className="request-card">
                    <div className="card-header">
                        <h3>Articles demandés</h3>
                        {totalQty > 0 && (
                            <span className="item-count">{totalQty} article{totalQty > 1 ? 's' : ''}</span>
                        )}
                    </div>

                    <div className="table-container">
                        <InlineDemandTable products={products} onLinesChange={setLines} />
                    </div>

                    <div className="motif-section">
                        <label htmlFor="motif" className="motif-label">
                            Motif de la demande
                        </label>
                        <textarea
                            id="motif"
                            className="motif-textarea"
                            placeholder="Décrivez brièvement la raison de cette demande..."
                            value={motif}
                            onChange={(e) => setMotif(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {hasLowStock && (
                        <div className="alert alert-warning">
                            <AlertCircle size={20} />
                            <div>
                                <strong>Attention !</strong>
                                <p>Certains articles demandés dépassent le stock disponible.</p>
                            </div>
                        </div>
                    )}

                    <div className="request-actions">
                        <button className="btn-cancel" onClick={() => setLines([])}>
                            Annuler
                        </button>
                        <button
                            className="btn-submit"
                            disabled={totalQty === 0 || isLoading}
                            onClick={handleSend}
                        >
                            {isLoading ? (
                                <>
                                    <div className="spinner" />
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={18} />
                                    Envoyer la demande
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="request-sidebar">
                    {/* Sidebar content maintained */}
                    <div className="info-card">
                        <h4>💡 Conseils</h4>
                        <ul>
                            <li>Vérifiez la disponibilité avant de commander</li>
                            <li>Les demandes sont traitées sous 24-48h</li>
                            <li>Vous recevrez une notification à chaque étape</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
