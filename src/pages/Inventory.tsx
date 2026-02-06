import * as React from 'react';
import { Search, Plus, Grid, List } from 'lucide-react';
import { ProductCard } from '../components/Inventory/ProductCard';
import { useMockData } from '../context/MockDataContext';
import { useToast } from '../context/ToastContext';
import './Inventory.css';

const UM_OPTIONS = [
    { value: 'pce', label: 'Pièce (pce)' },
    { value: 'feuille', label: 'Feuille' },
    { value: 'boite', label: 'Boite' },
    { value: 'paire', label: 'Paire' },
    { value: 'pkt', label: 'Paquet (pkt)' },
    { value: 'rame', label: 'Rame' },
    { value: 'kg', label: 'Kilogramme (kg)' },
    { value: 'litre', label: 'Litre' },
];

export const Inventory = () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterCategory, setFilterCategory] = React.useState('all');
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

    // Modal State for adding product
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [newProduct, setNewProduct] = React.useState({ label: '', um: 'pce', qtyPhysical: 0, qtyMini: 5, category: 'Papeterie', location: '' });

    // Modal State for editing product
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState<any>(null);

    // Restock Modal State
    const [showRestockModal, setShowRestockModal] = React.useState(false);
    const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
    const [restockQty, setRestockQty] = React.useState(1);

    const { products, addProduct, updateProduct, restockProduct } = useMockData();
    const toast = useToast();

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.label.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const lowStockCount = products.filter(p => p.qtyPhysical <= p.qtyMini).length;

    const handleAddProduct = () => {
        if (!newProduct.label) return;
        addProduct(newProduct);
        setShowAddModal(false);
        setNewProduct({ label: '', um: 'pce', qtyPhysical: 0, qtyMini: 5, category: 'Papeterie', location: '' });
        toast.success(`Le produit "${newProduct.label}" a été ajouté avec succès !`);
    };

    const handleEditClick = (product: any) => {
        setEditingProduct({ ...product });
        setShowEditModal(true);
    };

    const handleEditSubmit = () => {
        if (!editingProduct || !editingProduct.label) return;
        updateProduct(editingProduct.id, editingProduct);
        setShowEditModal(false);
        toast.success(`Le produit "${editingProduct.label}" a été mis à jour !`);
    };

    const handleRestockClick = (product: any) => {
        setSelectedProduct(product);
        setRestockQty(1);
        setShowRestockModal(true);
    };

    const handleRestockSubmit = () => {
        if (!selectedProduct || restockQty <= 0) return;
        restockProduct(selectedProduct.id, restockQty);
        setShowRestockModal(false);
        toast.success(`Réapprovisionnement de ${restockQty} ${selectedProduct.um} effectué pour "${selectedProduct.label}"`);
    };

    return (
        <div className="inventory-page">
            <div className="inventory-header">
                <div>
                    <h1 className="page-title">Inventaire & Stock</h1>
                    <p className="page-subtitle">
                        {products.length} articles • {lowStockCount} alertes de stock
                    </p>
                </div>
                <button className="btn-add" onClick={() => setShowAddModal(true)}>
                    <Plus size={20} />
                    Ajouter un article
                </button>
            </div>

            <div className="inventory-toolbar">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Rechercher un article..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input-large"
                    />
                </div>

                <div className="toolbar-actions">
                    <select
                        className="filter-select"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="all">Toutes catégories</option>
                        <option value="Papeterie">Papeterie</option>
                        <option value="Fournitures">Fournitures</option>
                        <option value="Électronique">Électronique</option>
                    </select>

                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="products-grid">
                    {filteredProducts.map((product, index) => (
                        <div
                            key={product.id}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <ProductCard
                                product={product}
                                onEdit={handleEditClick}
                                onRestock={handleRestockClick}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="products-list-container animate-fade-in">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Article</th>
                                <th>Catégorie</th>
                                <th>Unité</th>
                                <th>Stock Physique</th>
                                <th>Seuil Mini</th>
                                <th>Emplacement</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className={product.qtyPhysical <= product.qtyMini ? 'row-warning' : ''}>
                                    <td className="col-label"><strong>{product.label}</strong></td>
                                    <td>{product.category}</td>
                                    <td className="col-um">{product.um}</td>
                                    <td className={`col-qty ${product.qtyPhysical <= product.qtyMini ? 'text-danger' : ''}`}>
                                        {product.qtyPhysical}
                                    </td>
                                    <td>{product.qtyMini}</td>
                                    <td>{product.location}</td>
                                    <td className="col-actions">
                                        <button className="icon-btn" title="Modifier" onClick={() => handleEditClick(product)}>
                                            <Plus size={16} style={{ transform: 'rotate(45deg)' }} />
                                        </button>
                                        <button className="icon-btn primary" title="Réapprovisionner" onClick={() => handleRestockClick(product)}>
                                            <Plus size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal pour Ajouter un article */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content glass-effect" onClick={e => e.stopPropagation()}>
                        <h3><Plus size={24} /> Ajouter un nouvel article</h3>
                        <div className="modal-form">
                            <div className="form-group">
                                <label>Libellé du produit</label>
                                <input className="comment-input" placeholder="Ex: Stylo bille bleu" value={newProduct.label} onChange={e => setNewProduct({ ...newProduct, label: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Unité de mesure</label>
                                    <select className="filter-select" value={newProduct.um} onChange={e => setNewProduct({ ...newProduct, um: e.target.value })}>
                                        {UM_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Catégorie</label>
                                    <select className="filter-select" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                                        <option value="Papeterie">Papeterie</option>
                                        <option value="Fournitures">Fournitures</option>
                                        <option value="Électronique">Électronique</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Quantité Initiale</label>
                                    <input className="comment-input" type="number" value={newProduct.qtyPhysical} onChange={e => setNewProduct({ ...newProduct, qtyPhysical: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div className="form-group">
                                    <label>Seuil Minimal d'alerte</label>
                                    <input className="comment-input" type="number" value={newProduct.qtyMini} onChange={e => setNewProduct({ ...newProduct, qtyMini: parseInt(e.target.value) || 0 })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Emplacement (Stockage)</label>
                                <input className="comment-input" placeholder="Ex: Rayon A4" value={newProduct.location} onChange={e => setNewProduct({ ...newProduct, location: e.target.value })} />
                            </div>
                            <div className="modal-actions">
                                <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Annuler</button>
                                <button className="btn-approve" onClick={handleAddProduct}>Créer l'article</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal pour Modifier un article */}
            {showEditModal && editingProduct && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content glass-effect" onClick={e => e.stopPropagation()}>
                        <h3><Search size={24} style={{ transform: 'rotate(90deg)' }} /> Modifier l'article</h3>
                        <div className="modal-form">
                            <div className="form-group">
                                <label>Libellé du produit</label>
                                <input className="comment-input" value={editingProduct.label} onChange={e => setEditingProduct({ ...editingProduct, label: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Unité de mesure</label>
                                    <select className="filter-select" value={editingProduct.um} onChange={e => setEditingProduct({ ...editingProduct, um: e.target.value })}>
                                        {UM_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Catégorie</label>
                                    <select className="filter-select" value={editingProduct.category} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}>
                                        <option value="Papeterie">Papeterie</option>
                                        <option value="Fournitures">Fournitures</option>
                                        <option value="Électronique">Électronique</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Quantité Physique</label>
                                    <input className="comment-input" type="number" value={editingProduct.qtyPhysical} onChange={e => setEditingProduct({ ...editingProduct, qtyPhysical: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div className="form-group">
                                    <label>Seuil Minimal</label>
                                    <input className="comment-input" type="number" value={editingProduct.qtyMini} onChange={e => setEditingProduct({ ...editingProduct, qtyMini: parseInt(e.target.value) || 0 })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Emplacement</label>
                                <input className="comment-input" value={editingProduct.location} onChange={e => setEditingProduct({ ...editingProduct, location: e.target.value })} />
                            </div>
                            <div className="modal-actions">
                                <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Annuler</button>
                                <button className="btn-approve" onClick={handleEditSubmit}>Enregistrer les modifications</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Restock Modal */}
            {showRestockModal && selectedProduct && (
                <div className="modal-overlay" onClick={() => setShowRestockModal(false)}>
                    <div className="modal-content glass-effect" onClick={e => e.stopPropagation()}>
                        <h3><Plus size={24} /> Réapprovisionner </h3>
                        <div className="restock-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>{selectedProduct.label}</p>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                Stock actuel: <span className="gradient-text" style={{ fontWeight: 700 }}>{selectedProduct.qtyPhysical} {selectedProduct.um}</span>
                            </p>
                        </div>
                        <div className="modal-form">
                            <div className="form-group">
                                <label>Quantité à ajouter au stock physique</label>
                                <input
                                    className="comment-input"
                                    type="number"
                                    min="1"
                                    autoFocus
                                    value={restockQty}
                                    onChange={e => setRestockQty(parseInt(e.target.value) || 0)}
                                    onKeyDown={e => e.key === 'Enter' && handleRestockSubmit()}
                                />
                            </div>
                            <div className="modal-actions">
                                <button className="btn-cancel" onClick={() => setShowRestockModal(false)}>Annuler</button>
                                <button className="btn-approve" onClick={handleRestockSubmit}>Confirmer l'ajout</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
