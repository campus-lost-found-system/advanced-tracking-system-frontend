import React, { useEffect, useState } from 'react';
import { getForSaleItems, buyItem, Item } from '../api/services';
import { ShoppingBag, Package, IndianRupee, Loader2, Tag, MapPin } from 'lucide-react';
import Layout from '../components/Layout';

const Shop: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [buyingId, setBuyingId] = useState<string | null>(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await getForSaleItems();
            setItems(response.data || []);
        } catch (error) {
            console.error('Failed to fetch shop items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (item: Item) => {
        if (!confirm(
            `Are you sure you want to buy "${item.title}" for ₹${(item as any).price}?\n\nAfter confirmation, please visit the admin office to complete payment.`
        )) return;

        setBuyingId(item.id);
        try {
            const response = await buyItem(item.id);
            alert(response.message || 'Item reserved! Please visit the admin office to complete payment.');
            await fetchItems();
        } catch (error: any) {
            alert(error.response?.data?.error || error.response?.data?.message || 'Failed to reserve item');
        } finally {
            setBuyingId(null);
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-primary">Shop</h1>
                        <p className="text-xs text-text-muted">Unclaimed items available for purchase</p>
                    </div>
                    <div className="ml-auto badge bg-surface-50 text-text-secondary border border-surface-100">
                        {items.length} Items
                    </div>
                </div>

                {/* Items Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-[360px]" />)}
                    </div>
                ) : items.length === 0 ? (
                    <div className="card p-16 text-center" style={{ transform: 'none' }}>
                        <div className="w-16 h-16 rounded-2xl bg-surface-50 border border-surface-100 flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-8 h-8 text-text-muted" />
                        </div>
                        <h3 className="text-lg font-semibold text-primary mb-2">No Items for Sale</h3>
                        <p className="text-text-muted text-sm">Check back later for unclaimed items available for purchase.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {items.map((item, idx) => (
                            <div
                                key={item.id}
                                className="card overflow-hidden group animate-fade-in"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                {/* Image */}
                                <div className="relative h-48 bg-surface-50 flex items-center justify-center">
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl.startsWith('http') ? item.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.imageUrl}`}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <Package className="w-10 h-10 text-text-muted" />
                                    )}

                                    {/* Price badge */}
                                    <div className="absolute top-3 right-3 flex items-center gap-1 text-sm font-bold text-text-primary bg-surface-50 px-2.5 py-1 rounded-full shadow-sm">
                                        <IndianRupee className="w-3.5 h-3.5" />
                                        <span>{(item as any).price}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-3">
                                    <h3 className="text-base font-semibold text-primary">{item.title}</h3>
                                    <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed">{item.description}</p>

                                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted">
                                        {(item as any).location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                <span>{(item as any).location}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Tag className="w-3 h-3" />
                                            <span className="capitalize">{item.type}</span>
                                        </div>
                                    </div>

                                    {/* Buy button */}
                                    <button
                                        onClick={() => handleBuy(item)}
                                        disabled={buyingId === item.id || (item as any).saleStatus === 'reserved'}
                                        className="w-full btn-primary text-sm flex items-center justify-center gap-2 py-2.5 mt-2 disabled:opacity-50"
                                    >
                                        {buyingId === item.id ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (item as any).saleStatus === 'reserved' ? (
                                            <span>Reserved</span>
                                        ) : (
                                            <>
                                                <ShoppingBag className="w-4 h-4" />
                                                <span>Buy — ₹{(item as any).price}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Shop;
