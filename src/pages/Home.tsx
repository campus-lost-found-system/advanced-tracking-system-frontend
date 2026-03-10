import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItems, createClaim, approveSale, getMyItems, Item } from '../api/services';
import { Search, MapPin, Calendar, Plus, AlertCircle, IndianRupee, Package, TrendingUp, Eye, X, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
    const { userProfile } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const navigate = useNavigate();

    // Claim modal state
    const [claimModalOpen, setClaimModalOpen] = useState(false);
    const [claimFoundItemId, setClaimFoundItemId] = useState<string | null>(null);
    const [myLostItems, setMyLostItems] = useState<Item[]>([]);
    const [myLostLoading, setMyLostLoading] = useState(false);
    const [selectedLostItemId, setSelectedLostItemId] = useState<string | null>(null);
    const [claimSubmitting, setClaimSubmitting] = useState(false);

    useEffect(() => {
        fetchItems();
    }, [filter, userProfile]);

    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getItems(filter === 'all' ? undefined : filter);
            setItems(response.data || []);
        } catch (err) {
            console.error('Failed to fetch items:', err);
            setError('Failed to load items. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const openClaimModal = async (foundItemId: string) => {
        setClaimFoundItemId(foundItemId);
        setClaimModalOpen(true);
        setSelectedLostItemId(null);
        setMyLostLoading(true);
        try {
            const response = await getMyItems();
            const allMyItems: Item[] = response.data || [];
            // Filter to only show lost items
            setMyLostItems(allMyItems.filter((i: any) => i.type === 'lost'));
        } catch (err) {
            console.error('Failed to fetch my items:', err);
            setMyLostItems([]);
        } finally {
            setMyLostLoading(false);
        }
    };

    const handleClaimSubmit = async () => {
        if (!claimFoundItemId || !selectedLostItemId) return;
        setClaimSubmitting(true);
        try {
            await createClaim(claimFoundItemId, selectedLostItemId);
            alert('Claim submitted successfully!');
            setClaimModalOpen(false);
            navigate('/my-claims');
        } catch (error: any) {
            alert(error.response?.data?.message || error.response?.data?.error || 'Failed to submit claim');
        } finally {
            setClaimSubmitting(false);
        }
    };

    const handlePutOnSale = async (itemId: string) => {
        const priceStr = prompt('Enter the price (₹) to list this item for sale:');
        if (!priceStr) return;
        const price = parseFloat(priceStr);
        if (isNaN(price) || price <= 0) {
            alert('Please enter a valid positive price.');
            return;
        }

        setActionLoading(itemId);
        try {
            await approveSale(itemId, price);
            alert('Item successfully listed for sale! It has been moved to the Shop.');
            await fetchItems();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to list item for sale');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lostCount = items.filter(i => i.type === 'lost').length;
    const foundCount = items.filter(i => i.type === 'found').length;

    const claimFoundItem = claimFoundItemId ? items.find(i => i.id === claimFoundItemId) : null;

    return (
        <Layout>
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* ═══ Stats Bar ═══ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="stat-card flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <Package className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{items.length}</p>
                            <p className="text-xs text-zinc-500 font-medium">Total Items</p>
                        </div>
                    </div>
                    <div className="stat-card flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-300">{lostCount}</p>
                            <p className="text-xs text-zinc-500 font-medium">Lost Items</p>
                        </div>
                    </div>
                    <div className="stat-card flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Eye className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-300">{foundCount}</p>
                            <p className="text-xs text-zinc-500 font-medium">Found Items</p>
                        </div>
                    </div>
                </div>

                {/* ═══ Search & Filters ═══ */}
                <div className="card p-5 space-y-4" style={{ transform: 'none' }}>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search items by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input pl-10"
                            />
                        </div>
                        <button
                            onClick={() => navigate('/report')}
                            className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Report Item</span>
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {(['all', 'lost', 'found'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === type
                                    ? 'bg-gradient-accent text-white shadow-glow-sm'
                                    : 'bg-surface-100 text-zinc-400 hover:text-zinc-200 hover:bg-surface-200 border border-white/[0.04]'
                                    }`}
                            >
                                {type === 'all' ? `All (${items.length})` : type === 'lost' ? `Lost (${lostCount})` : `Found (${foundCount})`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ═══ Error ═══ */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm animate-scale-in">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* ═══ Items Grid ═══ */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="skeleton h-[320px]" />
                        ))}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="card p-16 text-center" style={{ transform: 'none' }}>
                        <div className="w-16 h-16 rounded-2xl bg-surface-200 flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-zinc-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-300 mb-2">No items found</h3>
                        <p className="text-zinc-500 text-sm mb-6">Try adjusting your search or filters</p>
                        <button
                            onClick={() => { setSearchTerm(''); setFilter('all'); }}
                            className="btn-secondary text-sm"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredItems.map((item, idx) => (
                            <div
                                key={item.id}
                                className="card overflow-hidden group animate-fade-in"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                {/* Image */}
                                {item.imageUrl ? (
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={item.imageUrl.startsWith('http') ? item.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.imageUrl}`}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60" />
                                        <div className="absolute top-3 right-3">
                                            <span className={`badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative h-32 bg-surface-200 flex items-center justify-center">
                                        <Package className="w-10 h-10 text-zinc-700" />
                                        <div className="absolute top-3 right-3">
                                            <span className={`badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-5 space-y-3">
                                    <h3 className="text-base font-semibold text-white group-hover:text-accent-light transition-colors">
                                        {item.title}
                                    </h3>

                                    <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-zinc-600">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span>{item.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{
                                                item.createdAt
                                                    ? (typeof item.createdAt === 'object' && '_seconds' in (item.createdAt as any))
                                                        ? new Date((item.createdAt as any)._seconds * 1000).toLocaleDateString()
                                                        : new Date(item.createdAt as string).toLocaleDateString()
                                                    : 'N/A'
                                            }</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-2 space-y-2">
                                        {item.status === 'pending' && userProfile?.role !== 'admin' && item.type === 'found' && (
                                            <button
                                                onClick={() => openClaimModal(item.id)}
                                                className="w-full btn-primary py-2.5 text-sm"
                                            >
                                                Claim This Item
                                            </button>
                                        )}
                                        {/* Admin Action: Put on Sale */}
                                        {userProfile?.role === 'admin' && item.type === 'found' && !['returned', 'sold', 'for_sale'].includes(item.status) && (
                                            <button
                                                onClick={() => handlePutOnSale(item.id)}
                                                disabled={actionLoading === item.id}
                                                className="w-full btn flex items-center justify-center gap-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 py-2.5 text-sm"
                                            >
                                                {actionLoading === item.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <IndianRupee className="w-4 h-4" />
                                                )}
                                                <span>{actionLoading === item.id ? 'Processing...' : 'Put on Sale'}</span>
                                            </button>
                                        )}
                                        {item.status === 'returned' && (
                                            <div className="text-center text-xs text-zinc-600 py-2 bg-surface-50 rounded-xl border border-white/[0.04]">
                                                ✓ Already Returned
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ═══ Claim Modal — Select Lost Item ═══ */}
                {claimModalOpen && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-lg card p-6 animate-scale-in space-y-5" style={{ transform: 'none' }}>
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-white">Select Your Lost Item</h2>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Choose which lost item you're claiming matches
                                        {claimFoundItem && <span className="text-accent-light"> "{claimFoundItem.title}"</span>}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setClaimModalOpen(false)}
                                    className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-surface-200 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Lost Items List */}
                            <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1">
                                {myLostLoading ? (
                                    <div className="flex items-center justify-center py-8 gap-3 text-zinc-500">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="text-sm">Loading your lost items...</span>
                                    </div>
                                ) : myLostItems.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Package className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                                        <p className="text-zinc-400 text-sm font-medium">No lost items found</p>
                                        <p className="text-zinc-600 text-xs mt-1">You need to report a lost item first</p>
                                        <button
                                            onClick={() => { setClaimModalOpen(false); navigate('/report'); }}
                                            className="btn-primary text-xs mt-4"
                                        >
                                            Report Lost Item
                                        </button>
                                    </div>
                                ) : (
                                    myLostItems.map((lostItem) => (
                                        <button
                                            key={lostItem.id}
                                            onClick={() => setSelectedLostItemId(lostItem.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedLostItemId === lostItem.id
                                                ? 'border-accent/40 bg-accent/10 ring-1 ring-accent/20'
                                                : 'border-white/[0.06] bg-surface-100 hover:bg-surface-200 hover:border-white/[0.1]'
                                                }`}
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-surface-200 flex items-center justify-center">
                                                {lostItem.imageUrl ? (
                                                    <img
                                                        src={lostItem.imageUrl.startsWith('http') ? lostItem.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${lostItem.imageUrl}`}
                                                        alt={lostItem.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Package className="w-5 h-5 text-zinc-600" />
                                                )}
                                            </div>
                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{lostItem.title}</p>
                                                <p className="text-xs text-zinc-500 truncate">{lostItem.description}</p>
                                                <p className="text-[11px] text-zinc-600 mt-0.5">{lostItem.location}</p>
                                            </div>
                                            {/* Selected indicator */}
                                            {selectedLostItemId === lostItem.id && (
                                                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Actions */}
                            {myLostItems.length > 0 && (
                                <div className="flex gap-3 pt-2 border-t border-white/[0.04]">
                                    <button
                                        onClick={() => setClaimModalOpen(false)}
                                        className="flex-1 btn-secondary py-2.5 text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleClaimSubmit}
                                        disabled={!selectedLostItemId || claimSubmitting}
                                        className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {claimSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        <span>{claimSubmitting ? 'Submitting...' : 'Submit Claim'}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Home;
