import api from './axios';

export interface Item {
    id: string;
    title: string;
    type: 'lost' | 'found';
    location: string;
    description: string;
    status: 'pending' | 'returned';
    imageUrl?: string;
    reportedBy: string;
    createdAt: string;
}

export interface Claim {
    id: string;
    itemId: string;
    lostItemId?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    item?: Item;
    lostItem?: Item;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    isProofRequest?: boolean;
    timestamp: string;
}

// Auth
export const login = async (campusId: string, password: string) => {
    const { data } = await api.post('/api/auth/login', { campusId, password });
    return data;
};

export const getProfile = async () => {
    const { data } = await api.get('/api/users/profile');
    return data;
};

export const updateProfile = async (profileData: any) => {
    const { data } = await api.put('/api/users/profile', profileData);
    return data;
};

// Items
export const getItems = async (type?: 'lost' | 'found') => {
    const { data } = await api.get('/api/items', { params: { type } });
    return data;
};

export const getReturnedItems = async () => {
    const { data } = await api.get('/api/items', { params: { status: 'returned' } });
    return data;
};

export const createItem = async (itemData: Partial<Item>) => {
    const { data } = await api.post('/api/items', itemData);
    return data;
};

export const uploadItemImage = async (itemId: string, imageBase64: string) => {
    const { data } = await api.post(`/api/items/${itemId}/image`, { image: imageBase64 });
    return data;
};

// Claims
export const createClaim = async (itemId: string, lostItemId: string) => {
    const { data } = await api.post('/api/claims', { itemId, lostItemId });
    return data;
};

export const getMyClaims = async () => {
    const { data } = await api.get('/api/claims/my');
    return data;
};

export const getClaimChat = async (claimId: string) => {
    const { data } = await api.get(`/api/claims/${claimId}/chat`);
    return data;
};

export const sendChatMessage = async (claimId: string, content: string) => {
    const { data } = await api.post(`/api/claims/${claimId}/chat`, { content });
    return data;
};

// Admin
export const getPendingClaims = async () => {
    const { data } = await api.get('/api/admin/claims/pending');
    return data;
};

export const approveClaim = async (claimId: string, remarks?: string) => {
    const { data } = await api.post(`/api/admin/claims/${claimId}/approve`, { remarks });
    return data;
};

export const rejectClaim = async (claimId: string, remarks?: string) => {
    const { data } = await api.post(`/api/admin/claims/${claimId}/reject`, { remarks });
    return data;
};

export const getAnalytics = async () => {
    const { data } = await api.get('/api/admin/analytics');
    return data;
};

// ==========================================
// EPIC 3: AI-Based Image Matching (Rewritten)
// ==========================================

/** Extract visual features from an item's image via Groq vision AI */
export const extractFeatures = async (itemId: string, collection: 'lostItems' | 'foundItems') => {
    const { data } = await api.post(`/api/ai/extract-features/${itemId}/${collection}`);
    return data;
};

/** Compare item against opposite collection and return top-10 ranked suggestions */
export const compareAndSuggest = async (itemId: string, collection: 'lostItems' | 'foundItems') => {
    const { data } = await api.post(`/api/ai/compare-and-suggest/${itemId}/${collection}`);
    return data;
};

/** Unified claim verification: AI image comparison + CCTV verification (admin) */
export const verifyClaimFull = async (claimId: string) => {
    const { data } = await api.post(`/api/ai/verify-claim/${claimId}`);
    return data;
};

// ==========================================
// EPIC 5: CCTV Verification (Rewritten)
// ==========================================

/** Seed cctvLogs collection with 7 days × 4 zones of synthetic entries (admin, run once) */
export const seedCctvLogs = async () => {
    const { data } = await api.post('/api/cctv/seed-logs');
    return data;
};

/** Run full CCTV-based claim verification: logs + visual + Groq verdict (admin) */
export const verifyClaim = async (claimId: string) => {
    const { data } = await api.post(`/api/cctv/verify-claim/${claimId}`);
    return data;
};

/** Read a previously saved CCTV verification result (admin) */
export const getVerificationResult = async (claimId: string) => {
    const { data } = await api.get(`/api/cctv/verification-result/${claimId}`);
    return data;
};

// ==========================================
// Items — User's own items management
// ==========================================

/** Fetch items reported by the logged-in user */
export const getMyItems = async () => {
    const { data } = await api.get('/api/items/my');
    return data;
};

/** Update an existing item */
export const updateItem = async (itemId: string, updates: Partial<Item>) => {
    const { data } = await api.put(`/api/items/${itemId}`, updates);
    return data;
};

/** Delete an item */
export const deleteItem = async (itemId: string) => {
    const { data } = await api.delete(`/api/items/${itemId}`);
    return data;
};

// ==========================================
// Admin — Extended claim management
// ==========================================

/** Reopen a previously approved/rejected claim (admin) */
export const reopenClaim = async (claimId: string) => {
    const { data } = await api.post(`/api/admin/claims/${claimId}/reopen`);
    return data;
};

/** Add an admin note to a claim */
export const addClaimNote = async (claimId: string, text: string) => {
    const { data } = await api.post(`/api/admin/claims/${claimId}/notes`, { text });
    return data;
};

/** Get evidence attached to a claim (admin) */
export const getClaimEvidence = async (claimId: string) => {
    const { data } = await api.get(`/api/admin/claims/${claimId}/evidence`);
    return data;
};

/** Request proof from the claimant (admin) */
export const requestProof = async (claimId: string) => {
    const { data } = await api.post(`/api/admin/claims/${claimId}/request-proof`);
    return data;
};

// ==========================================
// Sale feature
// ==========================================

/** Admin approves an item for sale with a price */
export const approveSale = async (itemId: string, price: number) => {
    const { data } = await api.post('/api/admin/sale/approve', { itemId, price });
    return data;
};

/** Buyer purchases an item */
export const buyItem = async (itemId: string) => {
    const { data } = await api.post('/api/sale/buy', { itemId });
    return data;
};
