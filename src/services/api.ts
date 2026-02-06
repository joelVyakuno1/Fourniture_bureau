
const API_BASE = '/api';

export interface Product {
    id: string;
    label: string;
    um: string;
    qtyPhysical: number;
    qtyMini: number;
    location: string;
    pictureUrl?: string;
}

export interface RequestLine {
    productId: string;
    qty: number;
}

export interface Request {
    id: string;
    userId: string;
    managerId?: string;
    created: string;
    status: 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Delivered';
    lines: RequestLine[];
    managerComment?: string;
    totalQty?: number;
}

export const api = {
    async getProducts(): Promise<Product[]> {
        const res = await fetch(`${API_BASE}/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
    },

    async updateProductQty(id: string, delta: number, comment: string, userId: string): Promise<Product> {
        const res = await fetch(`${API_BASE}/products/${id}/qty`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ delta, comment, userId })
        });
        if (!res.ok) throw new Error('Failed to update product qty');
        return res.json();
    },

    async createRequest(req: Partial<Request>): Promise<Request> {
        // Handle draft/create
        const res = await fetch(`${API_BASE}/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req)
        });
        if (!res.ok) throw new Error('Failed to create/update request');
        return res.json();
    },

    async getRequests(userId?: string, managerId?: string): Promise<Request[]> {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (managerId) params.append('managerId', managerId);

        const res = await fetch(`${API_BASE}/requests?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch requests');
        return res.json();
    },

    async approveRequest(id: string, comment: string, userId: string): Promise<Request> {
        const res = await fetch(`${API_BASE}/requests/${id}/approve`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment, userId })
        });
        if (!res.ok) throw new Error('Failed to approve request');
        return res.json();
    },

    async rejectRequest(id: string, comment: string, userId: string): Promise<Request> {
        const res = await fetch(`${API_BASE}/requests/${id}/reject`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment, userId })
        });
        if (!res.ok) throw new Error('Failed to reject request');
        return res.json();
    },

    async deliverRequest(id: string, userId: string): Promise<Request> {
        const res = await fetch(`${API_BASE}/requests/${id}/deliver`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        if (!res.ok) throw new Error('Failed to deliver request');
        return res.json();
    }
};
