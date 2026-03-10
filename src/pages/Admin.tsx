import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getPendingClaims, approveClaim, rejectClaim, reopenClaim,
    addClaimNote, getClaimEvidence, requestProof, getAnalytics,
    seedCctvLogs, approveSale, Claim
} from '../api/services';
import {
    Check, X, Calendar, MessageCircle, Video, Sparkles,
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

    useEffect(() => {
        fetchPendingClaims();
        fetchAnalytics();
    }, []);

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

                {/* ═══ Pending Claims ═══ */}
                {loading ? (
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
                                    <div className="flex-1 min-w-0 flex gap-4">
                                        {/* Thumbnail */}
                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-surface-200 border border-white/[0.04] flex items-center justify-center">
                                            {claim.item?.imageUrl ? (
                                                <img 
                                                    src={claim.item.imageUrl.startsWith('http') ? claim.item.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${claim.item.imageUrl}`} 
                                                    alt={claim.item?.title || 'Item'} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Package className="w-6 h-6 text-zinc-600" />
                                            )}
                                        </div>
                                        
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-base font-semibold text-white truncate">
                                                    {claim.item?.title || 'Item'}
                                                </h3>
                                                <span className={`badge ${claim.item?.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                                                    {claim.item?.type}
                                                </span>
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
                                        <>
                                            <button
                                                onClick={() => navigate(`/admin/matches/${claim.itemId}?collection=${claim.item?.type === 'found' ? 'foundItems' : 'lostItems'}`)}
                                                className="btn-secondary text-xs flex items-center gap-2 py-2 !border-violet-500/20 !text-violet-300 hover:!bg-violet-500/10"
                                            >
                                                <Sparkles className="w-3.5 h-3.5" />
                                                <span>AI Match</span>
                                            </button>
                                            <button
                                                onClick={() => navigate(`/admin/cctv/${claim.id}`, { state: { itemId: claim.itemId } })}
                                                className="btn-secondary text-xs flex items-center gap-2 py-2 !border-indigo-500/20 !text-indigo-300 hover:!bg-indigo-500/10"
                                            >
                                                <Video className="w-3.5 h-3.5" />
                                                <span>CCTV</span>
                                            </button>
                                        </>
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
                )}
            </div>
        </Layout>
    );
};

export default Admin;
