import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyClaims, Claim } from '../api/services';
import { MessageCircle, Calendar, AlertCircle, Package, ArrowRight, Clock } from 'lucide-react';
import Layout from '../components/Layout';

const MyClaims: React.FC = () => {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getMyClaims();
            setClaims(response.data || []);
        } catch (err) {
            console.error('Failed to fetch claims:', err);
            setError('Failed to load your claims. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return 'badge-approved';
            case 'rejected':
                return 'badge-rejected';
            default:
                return 'badge-pending';
        }
    };

    const getStatusBorder = (status: string) => {
        switch (status) {
            case 'approved': return 'border-l-emerald-500/50';
            case 'rejected': return 'border-l-red-500/50';
            default: return 'border-l-amber-500/50';
        }
    };

    return (
        <Layout>
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="stat-card flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <Package className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{claims.length}</p>
                            <p className="text-[11px] text-zinc-500 font-medium">Total</p>
                        </div>
                    </div>
                    <div className="stat-card flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-amber-300">{claims.filter(c => c.status === 'pending').length}</p>
                            <p className="text-[11px] text-zinc-500 font-medium">Pending</p>
                        </div>
                    </div>
                    <div className="stat-card flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Package className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-emerald-300">{claims.filter(c => c.status === 'approved').length}</p>
                            <p className="text-[11px] text-zinc-500 font-medium">Approved</p>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Claims List */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="skeleton h-28" />
                        ))}
                    </div>
                ) : claims.length === 0 ? (
                    <div className="card p-16 text-center" style={{ transform: 'none' }}>
                        <div className="w-16 h-16 rounded-2xl bg-surface-200 flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-zinc-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-300 mb-2">No claims yet</h3>
                        <p className="text-zinc-500 text-sm mb-6">Browse items and submit your first claim</p>
                        <button
                            onClick={() => navigate('/')}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            Browse Items
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {claims.map((claim, idx) => (
                            <div
                                key={claim.id}
                                className={`card border-l-[3px] ${getStatusBorder(claim.status)} p-5 animate-fade-in`}
                                style={{ animationDelay: `${idx * 80}ms` }}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-base font-semibold text-white truncate">
                                                {claim.item?.title || 'Item'}
                                            </h3>
                                            <span className={`badge ${getStatusBadge(claim.status)}`}>
                                                {claim.status}
                                            </span>
                                        </div>
                                        {claim.item?.description && (
                                            <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-3">
                                                {claim.item.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-zinc-600">
                                            <div className="flex items-center gap-1.5">
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

                                    {claim.status === 'pending' && (
                                        <button
                                            onClick={() => navigate(`/claims/${claim.id}/chat`)}
                                            className="btn-secondary text-xs flex items-center gap-2 flex-shrink-0"
                                        >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            <span>Chat</span>
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

export default MyClaims;
