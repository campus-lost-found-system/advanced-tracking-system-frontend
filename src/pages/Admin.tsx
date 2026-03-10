import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getPendingClaims, approveClaim, rejectClaim, reopenClaim,
    addClaimNote, getClaimEvidence, requestProof, getAnalytics,
    seedCctvLogs, approveSale, getReturnedItems, getForSaleItems, markItemSold, Claim, Item
} from '../api/services';
import {
    Check, X, Calendar, MessageCircle, Sparkles,
    Database, Loader2, RotateCcw, StickyNote, FileSearch,
    ShieldAlert, BarChart3, DollarSign, TrendingUp, Clock, Package
} from 'lucide-react';
import Layout from '../components/Layout';

interface AnalyticsData {
    total?: number;
    pending?: number;
    approved?: number;
    rejected?: number;
    [key: string]: any;
}

const Admin: React.FC = () => {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [seedLoading, setSeedLoading] = useState(false);
    const [seedMsg, setSeedMsg] = useState<string | null>(null);
    const navigate = useNavigate();

    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    const [evidenceData, setEvidenceData] = useState<any>(null);
    const [evidenceClaimId, setEvidenceClaimId] = useState<string | null>(null);
    const [evidenceLoading, setEvidenceLoading] = useState(false);

    const [activeTab, setActiveTab] = useState<'claims' | 'returned' | 'sale'>('claims');
    const [returnedItems, setReturnedItems] = useState<Item[]>([]);
    const [returnedLoading, setReturnedLoading] = useState(false);

    const [forSaleItems, setForSaleItems] = useState<Item[]>([]);
    const [saleLoading, setSaleLoading] = useState(false);

    useEffect(() => {
        fetchPendingClaims();
        fetchAnalytics();
        fetchReturnedItems();
        fetchForSaleItems();
    }, []);

    const fetchForSaleItems = async () => {
        setSaleLoading(true);
        try {
            const res = await getForSaleItems();
            setForSaleItems(res.data || []);
        } catch (error) {
            console.error('Failed to fetch for sale items', error);
        } finally {
            setSaleLoading(false);
        }
    };

    const fetchReturnedItems = async () => {
        setReturnedLoading(true);
        try {
            const response = await getReturnedItems();
            setReturnedItems(response.data || []);
        } catch (error) {
            console.error('Failed to fetch returned items:', error);
        } finally {
            setReturnedLoading(false);
        }
    };

    const fetchPendingClaims = async () => {
        setLoading(true);
        try {
            const response = await getPendingClaims();
            setClaims(response.data || []);
        } catch (error) {
            console.error('Failed to fetch pending claims:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const response = await getAnalytics();
            setAnalytics(response.data || null);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleMarkSold = async (itemId: string) => {
        if (!confirm('Mark this item as sold? It will be removed from the public shop.')) return;
        try {
            setActionLoading(itemId);
            await markItemSold(itemId);
            alert('Item marked as sold successfully!');
            await fetchForSaleItems();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to mark as sold');
        } finally {
            setActionLoading(null);
        }
    };

    const handleApprove = async (claimId: string) => {
        const remarks = prompt('Enter approval remarks (optional):');
        setActionLoading(claimId);
        try {
            await approveClaim(claimId, remarks || undefined);
            alert('Claim approved successfully!');
            await fetchPendingClaims();
            fetchAnalytics();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to approve claim');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (claimId: string) => {
        const remarks = prompt('Enter rejection reason:');
        if (!remarks) return;
        setActionLoading(claimId);
        try {
            await rejectClaim(claimId, remarks);
            alert('Claim rejected successfully!');
            await fetchPendingClaims();
            fetchAnalytics();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to reject claim');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReopen = async (claimId: string) => {
        setActionLoading(claimId);
        try {
            await reopenClaim(claimId);
            alert('Claim reopened successfully!');
            await fetchPendingClaims();
            fetchAnalytics();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to reopen claim');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAddNote = async (claimId: string) => {
        const text = prompt('Enter admin note:');
        if (!text) return;
        setActionLoading(claimId);
        try {
            await addClaimNote(claimId, text);
            alert('Note added successfully!');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to add note');
        } finally {
            setActionLoading(null);
        }
    };

    const handleViewEvidence = async (claimId: string) => {
        setEvidenceLoading(true);
        setEvidenceClaimId(claimId);
        try {
            const response = await getClaimEvidence(claimId);
            setEvidenceData(response.data);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to load evidence');
            setEvidenceClaimId(null);
        } finally {
            setEvidenceLoading(false);
        }
    };

    const handleRequestProof = async (claimId: string) => {
        if (!confirm('Request proof from the claimant?')) return;
        setActionLoading(claimId);
        try {
            await requestProof(claimId);
            alert('Proof request sent!');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to request proof');
        } finally {
            setActionLoading(null);
        }
    };

    const handleApproveSale = async (claimId: string, itemId: string) => {
        const priceStr = prompt('Enter sale price:');
        if (!priceStr) return;
        const price = parseFloat(priceStr);
        if (isNaN(price) || price <= 0) {
            alert('Please enter a valid price');
            return;
        }
        setActionLoading(claimId);
        try {
            await approveSale(itemId, price);
            alert('Item approved for sale!');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to approve for sale');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSeedCctv = async () => {
        setSeedLoading(true);
        setSeedMsg(null);
        try {
            const res = await seedCctvLogs();
            setSeedMsg(res.data?.message || `Seeded ${res.data?.seeded || '?'} entries`);
        } catch (e: any) {
            setSeedMsg(`Error: ${e.response?.data?.error || e.message}`);
        } finally {
            setSeedLoading(false);
        }
    };

    const analyticsCards = [
        { label: 'Total Claims', key: 'total', icon: BarChart3, color: 'bg-indigo-500/10 text-indigo-400', valueClass: 'text-white' },
        { label: 'Pending', key: 'pending', icon: Clock, color: 'bg-amber-500/10 text-amber-400', valueClass: 'text-amber-300' },
        { label: 'Approved', key: 'approved', icon: Check, color: 'bg-emerald-500/10 text-emerald-400', valueClass: 'text-emerald-300' },
        { label: 'Rejected', key: 'rejected', icon: X, color: 'bg-red-500/10 text-red-400', valueClass: 'text-red-300' },
    ];

    return (
        <Layout>
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* ═══ Actions Bar ═══ */}
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleSeedCctv}
                        disabled={seedLoading}
                        className="btn-secondary text-xs flex items-center gap-2"
                    >
                        {seedLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                        <span>{seedLoading ? 'Seeding...' : 'Seed CCTV'}</span>
                    </button>
                    <div className="ml-auto badge bg-surface-200 text-zinc-300 border border-white/[0.06]">
                        {claims.length} Pending
                    </div>
                </div>

                {seedMsg && (
                    <div className={`text-sm rounded-xl px-4 py-3 border animate-scale-in ${seedMsg.startsWith('Error')
                        ? 'bg-red-500/10 border-red-500/20 text-red-300'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        }`}>
                        {seedMsg}
                    </div>
                )}

                {/* ═══ Analytics Cards ═══ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {analyticsLoading ? (
                        [...Array(4)].map((_, i) => <div key={i} className="skeleton h-24" />)
                    ) : analytics ? (
                        analyticsCards.map((card) => (
                            <div key={card.key} className="stat-card">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-9 h-9 rounded-xl ${card.color} flex items-center justify-center`}>
                                        <card.icon className="w-[18px] h-[18px]" />
                                    </div>
                                    <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">{card.label}</span>
                                </div>
                                <p className={`text-3xl font-bold ${card.valueClass}`}>
                                    {(analytics as any)[card.key] ?? '—'}
                                </p>
                            </div>
                        ))
                    ) : null}
                </div>

                {/* ═══ Evidence Modal ═══ */}
                {evidenceClaimId && (
                    <div className="card p-6 animate-scale-in" style={{ transform: 'none' }}>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <FileSearch className="w-[18px] h-[18px] text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">Evidence</h3>
                                    <p className="text-[11px] text-zinc-500">Claim {evidenceClaimId.slice(0, 8)}...</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setEvidenceClaimId(null); setEvidenceData(null); }}
                                className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-surface-200 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {evidenceLoading ? (
                            <div className="flex items-center gap-3 text-zinc-500 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Loading evidence...</span>
                            </div>
                        ) : evidenceData ? (
                            <pre className="bg-surface rounded-xl border border-white/[0.04] p-4 text-xs text-zinc-400 overflow-x-auto whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                                {JSON.stringify(evidenceData, null, 2)}
                            </pre>
                        ) : (
                            <p className="text-zinc-600 text-sm">No evidence data available</p>
                        )}
                    </div>
                )}

                {/* ═══ Tabs ═══ */}
                <div className="flex gap-4 border-b border-white/[0.06] mb-6">
                    <button
                        onClick={() => setActiveTab('claims')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'claims' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Pending Claims
                        {activeTab === 'claims' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('returned')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'returned' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Returned Items ({returnedItems.length})
                        {activeTab === 'returned' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('sale')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'sale' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        For Sale ({forSaleItems.length})
                        {activeTab === 'sale' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />}
                    </button>
                </div>

                {/* ═══ Pending Claims List ═══ */}
                {activeTab === 'claims' && (
                    loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-40" />)}
                        </div>
                    ) : claims.length === 0 ? (
                        <div className="card p-16 text-center" style={{ transform: 'none' }}>
                            <div className="w-16 h-16 rounded-2xl bg-surface-200 flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-8 h-8 text-zinc-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-300 mb-2">All Clear!</h3>
                            <p className="text-zinc-500 text-sm">No pending claims to review</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {claims.map((claim, idx) => (
                                <div
                                    key={claim.id}
                                    className="card p-5 animate-fade-in"
                                    style={{ animationDelay: `${idx * 60}ms` }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 min-w-0">
                                            {/* Both items side-by-side */}
                                            <div className="flex gap-3 mb-3">
                                                {/* Found item thumbnail */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-emerald-400 uppercase tracking-widest mb-1.5 font-semibold">Found Item</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-200 border border-white/[0.04] flex items-center justify-center">
                                                            {claim.item?.imageUrl ? (
                                                                <img
                                                                    src={claim.item.imageUrl.startsWith('http') ? claim.item.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${claim.item.imageUrl}`}
                                                                    alt={claim.item?.title || 'Item'}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <Package className="w-5 h-5 text-zinc-600" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-white truncate">{claim.item?.title || 'Item'}</p>
                                                            <p className="text-[11px] text-zinc-600 truncate">{(claim.item as any)?.location || ''}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Lost item thumbnail */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-red-400 uppercase tracking-widest mb-1.5 font-semibold">Lost Item</p>
                                                    {(claim as any).lostItem ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-200 border border-white/[0.04] flex items-center justify-center">
                                                                {(claim as any).lostItem?.imageUrl ? (
                                                                    <img
                                                                        src={(claim as any).lostItem.imageUrl.startsWith('http') ? (claim as any).lostItem.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${(claim as any).lostItem.imageUrl}`}
                                                                        alt={(claim as any).lostItem?.title || 'Item'}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <Package className="w-5 h-5 text-zinc-600" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-white truncate">{(claim as any).lostItem?.title || 'Item'}</p>
                                                                <p className="text-[11px] text-zinc-600 truncate">{(claim as any).lostItem?.location || ''}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-zinc-600 italic">No linked lost item</p>
                                                    )}
                                                </div>
                                            </div>

                                            {claim.item?.description && (
                                                <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-3">
                                                    {claim.item.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{
                                                    claim.createdAt
                                                        ? (typeof claim.createdAt === 'object' && '_seconds' in (claim.createdAt as any))
                                                            ? new Date((claim.createdAt as any)._seconds * 1000).toLocaleDateString()
                                                            : new Date(claim.createdAt).toLocaleDateString()
                                                        : 'N/A'
                                                }</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Primary Actions */}
                                    <div className="flex flex-wrap gap-2 pt-3 border-t border-white/[0.04]">
                                        <button
                                            onClick={() => navigate(`/claims/${claim.id}/chat`)}
                                            className="btn-secondary text-xs flex items-center gap-2 py-2"
                                        >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            <span>Chat</span>
                                        </button>
                                        <button
                                            onClick={() => handleApprove(claim.id)}
                                            disabled={actionLoading === claim.id}
                                            className="btn-success text-xs flex items-center gap-2 py-2"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Approve</span>
                                        </button>
                                        <button
                                            onClick={() => handleReject(claim.id)}
                                            disabled={actionLoading === claim.id}
                                            className="btn-danger text-xs flex items-center gap-2 py-2"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                            <span>Reject</span>
                                        </button>

                                        {claim.itemId && (
                                            <button
                                                onClick={() => navigate(`/admin/verify/${claim.id}`)}
                                                className="btn-secondary text-xs flex items-center gap-2 py-2 !border-violet-500/20 !text-violet-300 hover:!bg-violet-500/10"
                                            >
                                                <Sparkles className="w-3.5 h-3.5" />
                                                <span>Verify Claim</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Secondary Actions */}
                                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/[0.03]">
                                        <button onClick={() => handleReopen(claim.id)} disabled={actionLoading === claim.id}
                                            className="text-[11px] text-zinc-500 hover:text-zinc-200 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-200 transition-all disabled:opacity-50">
                                            <RotateCcw className="w-3 h-3" /><span>Reopen</span>
                                        </button>
                                        <button onClick={() => handleAddNote(claim.id)} disabled={actionLoading === claim.id}
                                            className="text-[11px] text-zinc-500 hover:text-zinc-200 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-200 transition-all disabled:opacity-50">
                                            <StickyNote className="w-3 h-3" /><span>Note</span>
                                        </button>
                                        <button onClick={() => handleViewEvidence(claim.id)} disabled={actionLoading === claim.id}
                                            className="text-[11px] text-zinc-500 hover:text-zinc-200 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-200 transition-all disabled:opacity-50">
                                            <FileSearch className="w-3 h-3" /><span>Evidence</span>
                                        </button>
                                        <button onClick={() => handleRequestProof(claim.id)} disabled={actionLoading === claim.id}
                                            className="text-[11px] text-zinc-500 hover:text-zinc-200 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-200 transition-all disabled:opacity-50">
                                            <ShieldAlert className="w-3 h-3" /><span>Proof</span>
                                        </button>
                                        {claim.itemId && (
                                            <button onClick={() => handleApproveSale(claim.id, claim.itemId)} disabled={actionLoading === claim.id}
                                                className="text-[11px] text-amber-500/80 hover:text-amber-300 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-amber-500/10 transition-all disabled:opacity-50">
                                                <DollarSign className="w-3 h-3" /><span>Sale</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* ═══ Returned Items List ═══ */}
                {activeTab === 'returned' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {returnedLoading ? (
                            [...Array(6)].map((_, i) => <div key={i} className="skeleton h-[320px]" />)
                        ) : returnedItems.length === 0 ? (
                            <div className="card p-16 text-center col-span-full" style={{ transform: 'none' }}>
                                <div className="w-16 h-16 rounded-2xl bg-surface-200 flex items-center justify-center mx-auto mb-4">
                                    <Package className="w-8 h-8 text-zinc-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-300 mb-2">No Returned Items</h3>
                                <p className="text-zinc-500 text-sm">Items that have been successfully returned will appear here.</p>
                            </div>
                        ) : (
                            returnedItems.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className="card overflow-hidden group animate-fade-in"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    {/* Image */}
                                    <div className="relative h-48 bg-surface-200 flex items-center justify-center">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl.startsWith('http') ? item.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.imageUrl}`}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <Package className="w-10 h-10 text-zinc-700" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60" />
                                        <div className="absolute top-3 right-3 text-[10px] font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md uppercase backdrop-blur-md">
                                            Returned
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 space-y-3">
                                        <h3 className="text-base font-semibold text-white">{item.title}</h3>
                                        <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">{item.description}</p>
                                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-600">
                                            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /><span>{
                                                item.createdAt
                                                    ? (typeof item.createdAt === 'object' && '_seconds' in (item.createdAt as any))
                                                        ? new Date((item.createdAt as any)._seconds * 1000).toLocaleDateString()
                                                        : new Date(item.createdAt as string).toLocaleDateString()
                                                    : 'N/A'
                                            }</span></div>
                                            <div className="flex items-center gap-1.5 capitalize px-2 py-0.5 rounded-full bg-surface-200 border border-white/[0.04]">
                                                {item.type} Item
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
                {/* ═══ For Sale Items Tab ═══ */}
                {activeTab === 'sale' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {saleLoading ? (
                            [...Array(3)].map((_, i) => <div key={i} className="skeleton h-48" />)
                        ) : forSaleItems.length === 0 ? (
                            <div className="col-span-full card p-16 text-center" style={{ transform: 'none' }}>
                                <div className="w-16 h-16 rounded-2xl bg-surface-200 flex items-center justify-center mx-auto mb-4">
                                    <DollarSign className="w-8 h-8 text-zinc-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-300 mb-2">No Items for Sale</h3>
                                <p className="text-zinc-500 text-sm">Approve returned/unclaimed items for sale to see them here.</p>
                            </div>
                        ) : (
                            forSaleItems.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className="card p-5 animate-fade-in flex flex-col"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-200 flex-shrink-0">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl.startsWith('http') ? item.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.imageUrl}`}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-zinc-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-medium text-white line-clamp-1">{item.title}</h4>
                                                <span className="text-sm font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                                    ₹{item.price}
                                                </span>
                                            </div>
                                            <p className="text-sm text-zinc-500 line-clamp-2 mt-1">{item.description}</p>

                                            <div className="flex items-center gap-1.5 text-xs text-zinc-600 mt-2">
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
                                    </div>

                                    {(item as any).saleStatus === 'reserved' && (
                                        <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-200/80">
                                            <span className="font-semibold block mb-1">Reserved via Shop</span>
                                            Buyer ID: {(item as any).reservedBy}
                                        </div>
                                    )}

                                    <div className="mt-auto pt-4 border-t border-white/[0.04] flex justify-end">
                                        <button
                                            onClick={() => handleMarkSold(item.id)}
                                            disabled={actionLoading === item.id}
                                            className="btn flex items-center gap-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-4 py-2 text-sm"
                                        >
                                            {actionLoading === item.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Check className="w-4 h-4" />
                                            )}
                                            Mark Sold
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Admin;
