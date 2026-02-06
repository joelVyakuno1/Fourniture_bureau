import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, Product, Request, RequestLine } from '../services/api';

interface DataContextType {
    products: Product[];
    requests: Request[];
    createRequest: (userId: string, lines: { productId: string; qty: number }[]) => Promise<Request>;
    refreshData: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshData = async () => {
        setIsLoading(true);
        try {
            const [prods, reqs] = await Promise.all([
                api.getProducts(),
                api.getRequests() // Might need to filter by user in real app
            ]);
            setProducts(prods);
            setRequests(reqs);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const createRequest = async (userId: string, lines: { productId: string; qty: number }[]) => {
        setIsLoading(true);
        try {
            // Check stock? Logic is in NewRequest usually, or server rejects.
            // Server doesn't reject if stock low (just warning), unless sending? 
            // In spec: "Send button disabled while total qty = 0", "Real-time stock warning".
            // Delivery decrements stock. So creation is allowed even if low stock? 
            // "Real-time stock warning if qty > available" - this is UI.

            const req = await api.createRequest({
                userId,
                lines,
                status: 'Pending'
            });

            // Refresh requests
            const newRequests = await api.getRequests();
            setRequests(newRequests);
            return req;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DataContext.Provider value={{
            products,
            requests,
            createRequest,
            refreshData,
            isLoading,
            error
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
