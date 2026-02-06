import * as React from 'react';
import { CheckCircle, XCircle, Clock, User, Package } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { useMockData, type Request } from '../context/MockDataContext';
import { useToast } from '../context/ToastContext';
import './Approvals.css';

export const Approvals = () => {
    const { requests, updateRequestStatus, isLoading } = useMockData();
    const toast = useToast();

    const [selectedRequest, setSelectedRequest] = React.useState<Request | null>(null);
    const [comment, setComment] = React.useState('');
    const [showModal, setShowModal] = React.useState(false);
    const [actionType, setActionType] = React.useState<'approve' | 'reject'>('approve');

    const handleAction = (request: Request, action: 'approve' | 'reject') => {
        setSelectedRequest(request);
        setActionType(action);
        setShowModal(true);
    };

    const confirmAction = () => {
        if (!selectedRequest) return;

        updateRequestStatus(selectedRequest.id, actionType === 'approve' ? 'Approved' : 'Rejected', comment);

        setShowModal(false);
        setComment('');
        setSelectedRequest(null);

        if (actionType === 'approve') {
            toast.success(`Demande de ${selectedRequest.userId} approuvée !`);
        } else {
            toast.warning(`Demande de ${selectedRequest.userId} rejetée.`);
        }
    };

    const pendingRequests = requests.filter(r => r.status === 'Pending');

    return (
        <div className="approvals-page">
            <div className="page-header">
                <div className="header-content">
                    <div className="header-icon">
                        <CheckCircle size={32} />
                    </div>
                    <div>
                        <h1 className="page-title">Approbations</h1>
                        <p className="page-subtitle">
                            {pendingRequests.length} demande{pendingRequests.length > 1 ? 's' : ''} en attente
                        </p>
                    </div>
                </div>
            </div>

            {pendingRequests.length === 0 ? (
                <div className="empty-state">
                    <CheckCircle size={64} className="empty-icon" />
                    <h3>Aucune demande en attente</h3>
                    <p>Toutes les demandes ont été traitées</p>
                </div>
            ) : (
                <div className="requests-list">
                    {pendingRequests.map((request, index) => (
                        <div
                            key={request.id}
                            className="request-card animate-slide-up"
                            style={{ animationDelay: `${index * 75}ms` }}
                        >
                            <div className="request-header">
                                <div className="request-user">
                                    <div className="user-avatar">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h4 className="user-name">{request.userId}</h4>
                                        <div className="request-meta">
                                            <Clock size={14} />
                                            <span>{new Date(request.created).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</span>
                                        </div>
                                    </div>
                                </div>
                                <StatusBadge status={request.status} />
                            </div>

                            {request.motif && (
                                <div className="request-motif">
                                    <h5>Motif</h5>
                                    <p>{request.motif}</p>
                                </div>
                            )}

                            <div className="request-items">
                                <h5>Articles demandés ({request.lines.length})</h5>
                                <div className="items-list">
                                    {request.lines.map((line, i) => (
                                        <div key={i} className="item-row">
                                            <Package size={16} className="item-icon" />
                                            <span className="item-label">{line.productLabel}</span>
                                            <span className="item-qty">×{line.qty}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="request-actions">
                                <button
                                    className="btn-reject"
                                    onClick={() => handleAction(request, 'reject')}
                                    disabled={isLoading}
                                >
                                    <XCircle size={18} />
                                    Rejeter
                                </button>
                                <button
                                    className="btn-approve"
                                    onClick={() => handleAction(request, 'approve')}
                                    disabled={isLoading}
                                >
                                    <CheckCircle size={18} />
                                    Approuver
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content glass-effect" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {actionType === 'approve' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                            {actionType === 'approve' ? 'Approuver' : 'Rejeter'} la demande
                        </h3>
                        <p className="modal-subtitle">
                            Demande de {selectedRequest?.userId}
                        </p>

                        <div className="form-group">
                            <label htmlFor="comment">Commentaire (optionnel)</label>
                            <textarea
                                id="comment"
                                rows={4}
                                placeholder="Ajoutez un commentaire..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="comment-input"
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>
                                Annuler
                            </button>
                            <button
                                className={actionType === 'approve' ? 'btn-approve' : 'btn-reject'}
                                onClick={confirmAction}
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
