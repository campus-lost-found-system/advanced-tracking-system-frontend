import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyClaimFull, approveClaim, rejectClaim } from '../api/services';
import Layout from '../components/Layout';
import api from '../api/axios';
import {
    ArrowLeft, Sparkles, CheckCircle2, XCircle, Loader2, Shield,
    AlertTriangle, Package, MapPin, Check, X, Cpu, Video
} from 'lucide-react';

interface ClaimDetail {
    id: string;
    itemId: string;
    lostItemId?: string;
    status: string;
    zone?: string;
    dateOfLoss?: string;
    timeOfLoss?: string;
    item?: any;
    lostItem?: any;
}

interface FeatureData {
    category?: string;
    colors?: string[];
    shape?: string;
    size_estimate?: string;
    distinctive_features?: string[];
    texture?: string;
}

interface VerifyResult {
    aiMatch?: {
        similarity_score?: number;
        matching_attributes?: string[];
        mismatched_attributes?: string[];
        lostFeatures?: FeatureData;
        foundFeatures?: FeatureData;
        error?: string;
    };
    cctvVerification?: {
        match?: boolean;
        confidence?: number;
        reasoning?: string;
        verdict?: string;
        error?: string;
    };
}

const AdminMatches: React.FC = () => {
    const { claimId } = useParams<{ claimId: string }>();
    const navigate = useNavigate();

    const [claim, setClaim] = useState<ClaimDetail | null>(null);
    const [claimLoading, setClaimLoading] = useState(true);

    const [verifying, setVerifying] = useState(false);
    const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
    const [verifyError, setVerifyError] = useState<string | null>(null);

    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (claimId) loadClaim();
    }, [claimId]);

    const loadClaim = async () => {
        setClaimLoading(true);
        try {
            // Fetch claim details from pending claims and find the one
            const res = await api.get('/api/admin/claims/pending');
            const claims = res.data?.data || [];
            const found = claims.find((c: any) => c.id === claimId);
            if (found) {
                setClaim(found);
            } else {
                // Try fetching by directly constructing
                setClaim({ id: claimId!, itemId: '', status: 'pending' });
            }
        } catch (err) {
            console.error('Failed to load claim:', err);
        } finally {
            setClaimLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!claimId) return;
        setVerifying(true);
        setVerifyError(null);
        setVerifyResult(null);
        try {
            const res = await verifyClaimFull(claimId);
            setVerifyResult(res.data || res);
        } catch (err: any) {
            setVerifyError(err.response?.data?.error || err.message || 'Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const handleApprove = async () => {
        if (!claimId) return;
        const remarks = prompt('Enter approval remarks (optional):');
        setActionLoading(true);
        try {
            await approveClaim(claimId, remarks || undefined);
            alert('Claim approved successfully!');
            navigate('/admin');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to approve claim');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!claimId) return;
        const remarks = prompt('Enter rejection reason:');
        if (!remarks) return;
        setActionLoading(true);
        try {
            await rejectClaim(claimId, remarks);
            alert('Claim rejected.');
            navigate('/admin');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to reject claim');
        } finally {
            setActionLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 0.7) return 'from-emerald-500 to-green-600';
        if (score >= 0.5) return 'from-amber-500 to-yellow-600';
        return 'from-red-500 to-orange-600';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 0.7) return { text: 'High Confidence', cls: 'text-emerald-400' };
        if (score >= 0.5) return { text: 'Medium Confidence', cls: 'text-amber-400' };
        return { text: 'Low Confidence', cls: 'text-red-400' };
    };

    const getVerdictStyle = (verdict?: string) => {
        switch (verdict) {
            case 'likely_valid':
                return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-300', label: 'Likely Valid', icon: <CheckCircle2 className="w-5 h-5" /> };
            case 'possibly_valid':
                return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-300', label: 'Possibly Valid', icon: <AlertTriangle className="w-5 h-5" /> };
            case 'likely_invalid':
                return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-300', label: 'Likely Invalid', icon: <XCircle className="w-5 h-5" /> };
            default:
                return { bg: 'bg-surface-200', border: 'border-white/[0.06]', text: 'text-zinc-300', label: verdict || 'Unknown', icon: <Shield className="w-5 h-5" /> };
        }
    };

    const renderFeatures = (features: FeatureData | undefined, label: string) => {
        if (!features) return null;
        return (
            <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-semibold">{label}</p>
                <div className="grid grid-cols-2 gap-2">
                    {features.category && (
                        <div className="bg-surface rounded-lg border border-white/[0.04] p-2">
                            <p className="text-[9px] text-zinc-600 uppercase">Category</p>
                            <p className="text-white text-xs font-medium">{features.category}</p>
                        </div>
                    )}
                    {features.colors && features.colors.length > 0 && (
                        <div className="bg-surface rounded-lg border border-white/[0.04] p-2">
                            <p className="text-[9px] text-zinc-600 uppercase">Colors</p>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                                {features.colors.map((c, i) => (
                                    <span key={i} className="text-[10px] badge">{c}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {features.shape && (
                        <div className="bg-surface rounded-lg border border-white/[0.04] p-2">
                            <p className="text-[9px] text-zinc-600 uppercase">Shape</p>
                            <p className="text-white text-xs font-medium">{features.shape}</p>
                        </div>
                    )}
                    {features.texture && (
                        <div className="bg-surface rounded-lg border border-white/[0.04] p-2">
                            <p className="text-[9px] text-zinc-600 uppercase">Texture</p>
                            <p className="text-white text-xs font-medium">{features.texture}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const imgSrc = (url?: string) => {
        if (!url) return '';
        return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}`;
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Back */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </button>

                {claimLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32" />)}
                    </div>
                ) : (
                    <>
                        {/* ═══ Claim Header: Lost vs Found ═══ */}
                        <div className="card p-6" style={{ transform: 'none' }}>
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-violet-400" />
                                Claim Verification
                                <span className="text-xs badge bg-surface-200 text-zinc-400 border border-white/[0.04] ml-auto">{claimId?.slice(0, 8)}...</span>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Found Item */}
                                <div className="bg-surface rounded-xl border border-emerald-500/15 p-4">
                                    <p className="text-[10px] text-emerald-400 uppercase tracking-widest mb-3 font-semibold">Found Item</p>
                                    <div className="flex items-start gap-3">
                                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-200 flex items-center justify-center">
                                            {claim?.item?.imageUrl ? (
                                                <img src={imgSrc(claim.item.imageUrl)} alt={claim.item?.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-8 h-8 text-zinc-700" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-white">{claim?.item?.title || '—'}</p>
                                            <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{claim?.item?.description || ''}</p>
                                            <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-600">
                                                {claim?.item?.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{claim.item.location}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Lost Item */}
                                <div className="bg-surface rounded-xl border border-red-500/15 p-4">
                                    <p className="text-[10px] text-red-400 uppercase tracking-widest mb-3 font-semibold">Claimant's Lost Item</p>
                                    {claim?.lostItem ? (
                                        <div className="flex items-start gap-3">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-200 flex items-center justify-center">
                                                {claim.lostItem.imageUrl ? (
                                                    <img src={imgSrc(claim.lostItem.imageUrl)} alt={claim.lostItem?.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-8 h-8 text-zinc-700" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-white">{claim.lostItem?.title || '—'}</p>
                                                <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{claim.lostItem?.description || ''}</p>
                                                <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-600">
                                                    {claim.lostItem?.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{claim.lostItem.location}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-zinc-600 italic">No linked lost item</p>
                                    )}
                                </div>
                            </div>

                            {/* Report Metadata */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                {claim?.zone && (
                                    <div className="bg-surface rounded-xl border border-white/[0.04] p-3">
                                        <p className="text-[10px] text-red-400 uppercase tracking-widest mb-1">📍 Location</p>
                                        <p className="text-white font-medium text-sm">{claim.zone}</p>
                                    </div>
                                )}
                                {claim?.dateOfLoss && (
                                    <div className="bg-surface rounded-xl border border-white/[0.04] p-3">
                                        <p className="text-[10px] text-blue-400 uppercase tracking-widest mb-1">📅 Date</p>
                                        <p className="text-white font-medium text-sm">{claim.dateOfLoss}</p>
                                    </div>
                                )}
                                {claim?.timeOfLoss && (
                                    <div className="bg-surface rounded-xl border border-white/[0.04] p-3">
                                        <p className="text-[10px] text-green-400 uppercase tracking-widest mb-1">🕐 Time Window</p>
                                        <p className="text-white font-medium text-sm">{claim.timeOfLoss}</p>
                                    </div>
                                )}
                                {claim?.item?.category && (
                                    <div className="bg-surface rounded-xl border border-white/[0.04] p-3">
                                        <p className="text-[10px] text-amber-400 uppercase tracking-widest mb-1">📦 Category</p>
                                        <p className="text-white font-medium text-sm">{claim.item.category}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ═══ Run Verification Button ═══ */}
                        {!verifyResult && !verifying && (
                            <div className="card p-6" style={{ transform: 'none' }}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-violet-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-white">Run AI + CCTV Verification</h3>
                                            <p className="text-xs text-zinc-600">Extracts features from both items, compares them, and checks CCTV logs</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleVerify}
                                        className="btn-primary text-sm flex items-center gap-2 py-2.5 px-5"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        <span>Verify Now</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Loading */}
                        {verifying && (
                            <div className="card p-6 flex items-center gap-4 animate-scale-in" style={{ transform: 'none' }}>
                                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                                    <Loader2 className="w-5 h-5 text-accent-light animate-spin" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-indigo-200">Running AI image comparison & CCTV analysis...</p>
                                    <p className="text-xs text-zinc-600 mt-0.5">This may take 15-30 seconds</p>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {verifyError && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 animate-scale-in">
                                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <p className="text-red-300 text-sm">{verifyError}</p>
                            </div>
                        )}

                        {/* ═══ Verification Results ═══ */}
                        {verifyResult && (
                            <div className="space-y-6 animate-fade-in">

                                {/* Section 1: AI Image Match */}
                                <div className="card p-6" style={{ transform: 'none' }}>
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                            <Cpu className="w-[18px] h-[18px] text-violet-400" />
                                        </div>
                                        <h3 className="text-base font-semibold text-white">AI Image Match</h3>
                                    </div>

                                    {verifyResult.aiMatch?.error ? (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300">
                                            {verifyResult.aiMatch.error}
                                        </div>
                                    ) : verifyResult.aiMatch ? (
                                        <div className="space-y-5">
                                            {/* Score */}
                                            <div>
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className={`text-sm font-semibold ${getScoreLabel(verifyResult.aiMatch.similarity_score || 0).cls}`}>
                                                        {getScoreLabel(verifyResult.aiMatch.similarity_score || 0).text}
                                                    </span>
                                                    <span className="text-3xl font-bold text-white">
                                                        {((verifyResult.aiMatch.similarity_score || 0) * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-surface-300 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(verifyResult.aiMatch.similarity_score || 0)} transition-all duration-1000`}
                                                        style={{ width: `${Math.min((verifyResult.aiMatch.similarity_score || 0) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Matching / Mismatched Attributes */}
                                            <div className="flex flex-wrap gap-4">
                                                {verifyResult.aiMatch.matching_attributes && verifyResult.aiMatch.matching_attributes.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">Matching</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {verifyResult.aiMatch.matching_attributes.map((a, i) => (
                                                                <span key={i} className="badge badge-approved text-[10px]">✓ {a}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {verifyResult.aiMatch.mismatched_attributes && verifyResult.aiMatch.mismatched_attributes.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">Mismatched</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {verifyResult.aiMatch.mismatched_attributes.map((a, i) => (
                                                                <span key={i} className="badge badge-rejected text-[10px]">✗ {a}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Features comparison */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/[0.04]">
                                                {renderFeatures(verifyResult.aiMatch.lostFeatures, 'Lost Item Features')}
                                                {renderFeatures(verifyResult.aiMatch.foundFeatures, 'Found Item Features')}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>

                                {/* Section 2: CCTV Verification */}
                                <div className="card p-6" style={{ transform: 'none' }}>
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                            <Video className="w-[18px] h-[18px] text-indigo-400" />
                                        </div>
                                        <h3 className="text-base font-semibold text-white">CCTV Verification</h3>
                                    </div>

                                    {verifyResult.cctvVerification?.error ? (
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300">
                                            <p className="font-medium mb-1">CCTV check unavailable</p>
                                            <p className="text-xs text-amber-400/70">{verifyResult.cctvVerification.error}</p>
                                        </div>
                                    ) : verifyResult.cctvVerification ? (
                                        <div className="space-y-4">
                                            {/* Verdict Badge */}
                                            {(() => {
                                                const style = getVerdictStyle(verifyResult.cctvVerification.verdict);
                                                return (
                                                    <div className={`flex items-center justify-between p-4 rounded-xl border ${style.bg} ${style.border}`}>
                                                        <div className="flex items-center gap-3">
                                                            <span className={style.text}>{style.icon}</span>
                                                            <div>
                                                                <p className={`font-semibold ${style.text}`}>{style.label}</p>
                                                                <p className="text-[11px] text-zinc-600">CCTV AI Verdict</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-3xl font-bold text-white">
                                                                {((verifyResult.cctvVerification.confidence || 0) * 100).toFixed(0)}%
                                                            </span>
                                                            <p className="text-[11px] text-zinc-600">Confidence</p>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* Confidence Bar */}
                                            <div className="w-full bg-surface-300 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${(verifyResult.cctvVerification.confidence || 0) >= 0.7
                                                        ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                                                        : (verifyResult.cctvVerification.confidence || 0) >= 0.4
                                                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                                                            : 'bg-gradient-to-r from-red-500 to-orange-500'
                                                        }`}
                                                    style={{ width: `${(verifyResult.cctvVerification.confidence || 0) * 100}%` }}
                                                />
                                            </div>

                                            {/* Match + Reasoning */}
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-zinc-500">Match:</span>
                                                <span className={verifyResult.cctvVerification.match ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                                                    {verifyResult.cctvVerification.match ? '✓ Yes' : '✗ No'}
                                                </span>
                                            </div>

                                            {verifyResult.cctvVerification.reasoning && (
                                                <div className="bg-surface rounded-xl border border-white/[0.04] p-4">
                                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">AI Reasoning</p>
                                                    <p className="text-zinc-300 text-sm leading-relaxed">{verifyResult.cctvVerification.reasoning}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>

                                {/* ═══ Admin Decision ═══ */}
                                <div className="card p-6" style={{ transform: 'none' }}>
                                    <h3 className="text-base font-semibold text-white mb-4">Admin Decision</h3>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleApprove}
                                            disabled={actionLoading}
                                            className="flex-1 btn-success py-3 text-sm flex items-center justify-center gap-2 font-semibold"
                                        >
                                            <Check className="w-4 h-4" />
                                            <span>Approve</span>
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            disabled={actionLoading}
                                            className="flex-1 btn-danger py-3 text-sm flex items-center justify-center gap-2 font-semibold"
                                        >
                                            <X className="w-4 h-4" />
                                            <span>Reject</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
};

export default AdminMatches;
