import * as React from 'react';
import { Package, AlertTriangle, TrendingUp, Edit, Plus } from 'lucide-react';
import './ProductCard.css';

interface Product {
    id: string;
    label: string;
    um: string;
    qtyPhysical: number;
    qtyMini: number;
    location: string;
    pictureUrl?: string;
    category?: string;
}

interface ProductCardProps {
    product: Product;
    onEdit?: (product: Product) => void;
    onRestock?: (product: Product) => void;
}

export const ProductCard = ({ product, onEdit, onRestock }: ProductCardProps) => {
    const stockPercentage = (product.qtyPhysical / product.qtyMini) * 100;
    const isLowStock = product.qtyPhysical <= product.qtyMini;
    const isCritical = product.qtyPhysical < product.qtyMini * 0.5;

    return (
        <div className={`product-card animate-scale-in hover-lift ${isCritical ? 'critical' : ''}`}>
            <div className="product-image">
                {product.pictureUrl ? (
                    <img src={product.pictureUrl} alt={product.label} />
                ) : (
                    <div className="product-placeholder">
                        <Package size={48} />
                    </div>
                )}
                {isLowStock && (
                    <div className={`stock-badge ${isCritical ? 'critical' : 'warning'}`}>
                        <AlertTriangle size={14} />
                        {isCritical ? 'Critique' : 'Faible'}
                    </div>
                )}
            </div>

            <div className="product-content">
                <div className="product-header">
                    <h4 className="product-name">{product.label}</h4>
                    <span className="product-location">{product.location}</span>
                </div>

                <div className="product-stock">
                    <div className="stock-info">
                        <span className="stock-label">Stock actuel</span>
                        <span className={`stock-value ${isLowStock ? 'low' : ''}`}>
                            {product.qtyPhysical} {product.um}
                        </span>
                    </div>
                    <div className="stock-bar">
                        <div
                            className={`stock-fill ${isCritical ? 'critical' : isLowStock ? 'warning' : 'normal'}`}
                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                        />
                    </div>
                    <div className="stock-min">
                        Minimum: {product.qtyMini} {product.um}
                    </div>
                </div>

                <div className="product-actions">
                    <button className="btn-secondary" onClick={() => onEdit?.(product)}>
                        <Edit size={16} />
                        Modifier
                    </button>
                    <button className="btn-primary" onClick={() => onRestock?.(product)}>
                        <Plus size={16} />
                        Réapprovisionner
                    </button>
                </div>
            </div>
        </div>
    );
};
