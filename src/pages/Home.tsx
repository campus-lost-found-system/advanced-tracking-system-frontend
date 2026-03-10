import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItems, createClaim, buyItem, Item } from '../api/services';
import { Search, MapPin, Calendar, Plus, AlertCircle, ShoppingCart, Package, TrendingUp, Eye } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
    const { userProfile } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [buyLoading, setBuyLoading] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (userProfile?.role === 'admin') {
            navigate('/admin');
            return;
        }
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

    const handleClaim = async (itemId: string) => {
        try {
            await createClaim(itemId);
            alert('Claim submitted successfully!');
            navigate('/my-claims');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to submit claim');
        }
    };

    const handleBuy = async (itemId: string) => {
        if (!confirm('Are you sure you want to purchase this item?')) return;
        setBuyLoading(itemId);
        try {
            await buyItem(itemId);
            alert('Purchase successful!');
            await fetchItems();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to purchase item');
        } finally {
            setBuyLoading(null);
        }
    };

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lostCount = items.filter(i => i.type === 'lost').length;
    const foundCount = items.filter(i => i.type === 'found').length;

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
                                                        : new Date(item.createdAt).toLocaleDateString()
                                                    : 'N/A'
                                            }</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-2 space-y-2">
                                        {item.status === 'pending' && (
                                            <button
                                                onClick={() => handleClaim(item.id)}
                                                className="w-full btn-primary py-2.5 text-sm"
                                            >
                                                Claim This Item
                                            </button>
                                        )}
                                        {(item as any).saleEligible && (
                                            <button
                                                onClick={() => handleBuy(item.id)}
                                                disabled={buyLoading === item.id}
                                                className="w-full btn-success py-2.5 text-sm flex items-center justify-center gap-2"
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                <span>{buyLoading === item.id ? 'Processing...' : `Buy · ₹${(item as any).price || '?'}`}</span>
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
            </div>
        </Layout>
    );
};

export default Home;
