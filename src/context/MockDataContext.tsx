import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Simulate ID gen

// Interfaces
export interface Product {
    id: string;
    label: string;
    um: string;
    qtyPhysical: number;
    qtyMini: number;
    location: string;
    pictureUrl?: string;
    category: string;
}

export interface RequestLine {
    productId: string;
    productLabel: string;
    qty: number;
}

export interface Request {
    id: string;
    userId: string;
    managerId?: string;
    created: string; // ISO date
    status: 'Pending' | 'Approved' | 'Rejected' | 'Delivered';
    lines: RequestLine[];
    motif?: string; // Reason for the request
    managerComment?: string;
}

export interface Activity {
    id: string;
    type: 'request' | 'approval' | 'delivery' | 'rejection' | 'stock_update';
    user: string;
    message: string;
    timestamp: string; // Friendly string "Il y a 5 min" or ISO
    isoTimestamp: string;
}

interface MockDataContextType {
    products: Product[];
    requests: Request[];
    activities: Activity[];
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (id: string, updates: Partial<Product>) => void;
    updateProductStock: (id: string, newQty: number) => void;
    createRequest: (userId: string, lines: { productId: string; qty: number }[], motif?: string) => void;
    updateRequestStatus: (requestId: string, status: 'Approved' | 'Rejected', comment?: string) => void;
    deliverRequest: (requestId: string) => void;
    restockProduct: (productId: string, qty: number) => void;
    isLoading: boolean;
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export const MockDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- Initial Mock Data ---
    const [products, setProducts] = useState<Product[]>([
        { id: 'p1', label: 'Stylo Bleu Bic', um: 'pc', qtyPhysical: 150, qtyMini: 50, location: 'A1', category: 'Papeterie' },
        { id: 'p2', label: 'Cahier A4 200 pages', um: 'pc', qtyPhysical: 25, qtyMini: 30, location: 'B2', category: 'Papeterie' },
        { id: 'p3', label: 'Agrafeuse Métallique', um: 'pc', qtyPhysical: 45, qtyMini: 20, location: 'C1', category: 'Fournitures' },
        { id: 'p4', label: 'Ramette Papier A4', um: 'pc', qtyPhysical: 8, qtyMini: 25, location: 'D3', category: 'Papeterie' },
        { id: 'p5', label: 'Marqueur Permanent', um: 'pc', qtyPhysical: 5, qtyMini: 15, location: 'A2', category: 'Papeterie' },
        { id: 'p6', label: 'Classeur à Levier', um: 'pc', qtyPhysical: 60, qtyMini: 30, location: 'B1', category: 'Fournitures' },
        { id: 'p7', label: 'Post-it Jaune', um: 'bloc', qtyPhysical: 120, qtyMini: 40, location: 'C2', category: 'Papeterie' },
    ]);

    const [requests, setRequests] = useState<Request[]>([
        {
            id: 'r1',
            userId: 'marie.dubois@company.com',
            created: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            status: 'Pending',
            lines: [
                { productId: 'p1', productLabel: 'Stylo Bleu Bic', qty: 20 },
                { productId: 'p2', productLabel: 'Cahier A4 200 pages', qty: 10 },
            ]
        }
    ]);

    const [activities, setActivities] = useState<Activity[]>([
        { id: 'a1', type: 'request', user: 'Marie Dubois', message: 'a créé une nouvelle demande', timestamp: 'Il y a 1 jour', isoTimestamp: new Date(Date.now() - 86400000).toISOString() }
    ]);

    const [isLoading, setIsLoading] = useState(false);

    // --- Actions ---

    const addActivity = (type: Activity['type'], user: string, message: string) => {
        const newActivity: Activity = {
            id: crypto.randomUUID(),
            type,
            user,
            message,
            timestamp: "À l'instant",
            isoTimestamp: new Date().toISOString()
        };
        setActivities(prev => [newActivity, ...prev]);
    };

    const addProduct = (product: Omit<Product, 'id'>) => {
        const newProduct = { ...product, id: crypto.randomUUID() };
        setProducts(prev => [...prev, newProduct]);
        addActivity('stock_update', 'Admin', `a ajouté le produit ${product.label}`);
    };

    const updateProductStock = (id: string, newQty: number) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, qtyPhysical: newQty } : p));
    };

    const updateProduct = (id: string, updates: Partial<Product>) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        const prod = products.find(p => p.id === id);
        if (prod) {
            addActivity('stock_update', 'Admin', `a modifié le produit ${updates.label || prod.label}`);
        }
    };

    const createRequest = (userId: string, requestLines: { productId: string; qty: number }[], motif?: string) => {
        setIsLoading(true);
        setTimeout(() => {
            const fullLines = requestLines.map(l => {
                const prod = products.find(p => p.id === l.productId);
                return {
                    productId: l.productId,
                    productLabel: prod ? prod.label : 'Inconnu',
                    qty: l.qty
                };
            });

            const newRequest: Request = {
                id: crypto.randomUUID(),
                userId,
                created: new Date().toISOString(),
                status: 'Pending',
                lines: fullLines,
                motif
            };

            setRequests(prev => [newRequest, ...prev]);
            addActivity('request', userId, 'a créé une nouvelle demande');
            setIsLoading(false);
        }, 600);
    };

    const updateRequestStatus = (requestId: string, status: 'Approved' | 'Rejected', comment?: string) => {
        setIsLoading(true);
        setTimeout(() => {
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status, managerComment: comment } : r));
            const req = requests.find(r => r.id === requestId);
            if (req) {
                const action = status === 'Approved' ? 'a approuvé' : 'a rejeté';
                addActivity(status === 'Approved' ? 'approval' : 'rejection', 'Manager', `${action} la demande de ${req.userId}`);
            }
            setIsLoading(false);
        }, 600);
    };

    const deliverRequest = (requestId: string) => {
        setIsLoading(true);
        setTimeout(() => {
            // 1. Update Request Status
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Delivered' } : r));

            // 2. Decrement Stock
            const req = requests.find(r => r.id === requestId);
            if (req) {
                req.lines.forEach(line => {
                    setProducts(prev => prev.map(p => {
                        if (p.id === line.productId) {
                            return { ...p, qtyPhysical: Math.max(0, p.qtyPhysical - line.qty) };
                        }
                        return p;
                    }));
                });
                addActivity('delivery', 'Logistique', `a livré la commande de ${req.userId}`);
            }
            setIsLoading(false);
        }, 600);
    };

    const restockProduct = (productId: string, qty: number) => {
        setIsLoading(true);
        setTimeout(() => {
            setProducts(prev => prev.map(p => {
                if (p.id === productId) {
                    return { ...p, qtyPhysical: p.qtyPhysical + qty };
                }
                return p;
            }));

            const prod = products.find(p => p.id === productId);
            if (prod) {
                addActivity('stock_update', 'Secretariat', `a réapprovisionné le produit ${prod.label} (+${qty})`);
            }

            setIsLoading(false);
        }, 600);
    };

    return (
        <MockDataContext.Provider value={{
            products,
            requests,
            activities,
            addProduct,
            updateProduct,
            updateProductStock,
            createRequest,
            updateRequestStatus,
            deliverRequest,
            restockProduct,
            isLoading
        }}>
            {children}
        </MockDataContext.Provider>
    );
};

export const useMockData = () => {
    const context = useContext(MockDataContext);
    if (!context) {
        throw new Error('useMockData must be used within a MockDataProvider');
    }
    return context;
};
