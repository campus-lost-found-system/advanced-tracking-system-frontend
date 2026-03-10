import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { seedCctvLogs, verifyClaim, getVerificationResult } from '../api/services';
import Layout from '../components/Layout';
import { ArrowLeft, Shield, Database, Play, FileSearch, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface VerificationResult {
    match?: boolean;
    confidence?: number;
    reasoning?: string;
    verdict?: 'likely_valid' | 'possibly_valid' | 'likely_invalid';
    claimId?: string;
    verifiedAt?: string;
}

const AdminCCTV: React.FC = () => {
    const { claimId } = useParams<{ claimId: string }>();
    const navigate = useNavigate();

    const [seedLoading, setSeedLoading] = useState(false);
    const [seedResult, setSeedResult] = useState<string | null>(null);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [savedResult, setSavedResult] = useState<VerificationResult | null>(null);
    const [savedLoading, setSavedLoading] = useState(true);
    const [savedError, setSavedError] = useState<string | null>(null);

    useEffect(() => {
        if (claimId) loadSavedResult();
    }, [claimId]);

    const loadSavedResult = async () => {
        setSavedLoading(true);
        setSavedError(null);
        try {
            const res = await getVerificationResult(claimId!);
            setSavedResult(res.data || null);
        } catch (e: any) {
            if (e.response?.status === 404) setSavedError('No previous verification found');
            else setSavedError(e.response?.data?.error || 'Failed to load');
        } finally {
            setSavedLoading(false);
        }
    };

    const handleSeedLogs = async () => {
        setSeedLoading(true);
        try {
            const res = await seedCctvLogs();
            setSeedResult(res.data?.message || `Seeded ${res.data?.seeded || '?'} entries`);
        } catch (e: any) {
            setSeedResult(`Error: ${e.response?.data?.error || e.message}`);
        } finally {
            setSeedLoading(false);
        }
    };

    const handleVerifyClaim = async () => {
        if (!claimId) return;
        setVerifyLoading(true);
        setVerifyError(null);
        setVerifyResult(null);
        try {
            const res = await verifyClaim(claimId);
            setVerifyResult(res.data || res);
            loadSavedResult();
        } catch (e: any) {
            setVerifyError(e.response?.data?.error || e.message || 'Verification failed');
        } finally {
            setVerifyLoading(false);
        }
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

    const renderVerdict = (result: VerificationResult) => {
        const style = getVerdictStyle(result.verdict);
        return (
            <div className="space-y-4 mt-5 animate-fade-in">
                {/* Verdict Badge */}
                <div className={`flex items-center justify-between p-4 rounded-xl border ${style.bg} ${style.border}`}>
                    <div className="flex items-center gap-3">
                        <span className={style.text}>{style.icon}</span>
                        <div>
                            <p className={`font-semibold ${style.text}`}>{style.label}</p>
                            <p className="text-[11px] text-zinc-600">AI Verdict</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-bold text-white">{((result.confidence || 0) * 100).toFixed(0)}%</span>
                        <p className="text-[11px] text-zinc-600">Confidence</p>
                    </div>
                </div>

                {/* Confidence Bar */}
                <div className="w-full bg-surface-300 rounded-full h-2.5 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${result.confidence && result.confidence >= 0.7 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                                result.confidence && result.confidence >= 0.4 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                                    'bg-gradient-to-r from-red-500 to-orange-500'
                            }`}
                        style={{ width: `${(result.confidence || 0) * 100}%` }}
                    />
                </div>

                {/* Match Flag */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-500">Match:</span>
                    <span className={result.match ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                        {result.match ? '✓ Yes' : '✗ No'}
                    </span>
                </div>

                {/* Reasoning */}
                {result.reasoning && (
                    <div className="bg-surface rounded-xl border border-white/[0.04] p-4">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">AI Reasoning</p>
                        <p className="text-zinc-300 text-sm leading-relaxed">{result.reasoning}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>

                {/* Claim info */}
                <div className="text-sm text-zinc-500">
                    Claim: <code className="text-zinc-300 bg-surface-200 px-2 py-0.5 rounded-lg text-xs">{claimId}</code>
                </div>

                {/* ═══ Seed CCTV Logs ═══ */}
                <div className="card p-6" style={{ transform: 'none' }}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Database className="w-[18px] h-[18px] text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-white">Seed CCTV Logs</h2>
                                <p className="text-xs text-zinc-600">Populate with 7 days of synthetic data</p>
                            </div>
                        </div>
                        <button onClick={handleSeedLogs} disabled={seedLoading}
                            className="btn-secondary text-xs flex items-center gap-2 py-2.5 !border-blue-500/20 !text-blue-300 hover:!bg-blue-500/10">
                            {seedLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                            <span>{seedLoading ? 'Seeding...' : 'Seed Now'}</span>
                        </button>
                    </div>
                    {seedResult && (
                        <div className={`mt-4 rounded-xl px-4 py-3 text-sm border ${seedResult.startsWith('Error')
                                ? 'bg-red-500/10 border-red-500/20 text-red-300'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                            }`}>
                            {seedResult}
                        </div>
                    )}
                </div>

                {/* ═══ Run Verification ═══ */}
                <div className="card p-6" style={{ transform: 'none' }}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <Play className="w-[18px] h-[18px] text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-white">Run Verification</h2>
                                <p className="text-xs text-zinc-600">CCTV logs + visual match + Groq AI verdict</p>
                            </div>
                        </div>
                        <button onClick={handleVerifyClaim} disabled={verifyLoading}
                            className="btn-primary text-xs flex items-center gap-2 py-2.5">
                            {verifyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{verifyLoading ? 'Analyzing...' : 'Verify'}</span>
                        </button>
                    </div>

                    {verifyLoading && (
                        <div className="mt-4 bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4 flex items-center gap-3 animate-scale-in">
                            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin flex-shrink-0" />
                            <div>
                                <p className="text-sm text-indigo-200">Analyzing CCTV logs and running visual comparison...</p>
                                <p className="text-[11px] text-zinc-600 mt-0.5">This may take 15-30 seconds</p>
                            </div>
                        </div>
                    )}

                    {verifyError && (
                        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <p className="text-red-300 text-sm">{verifyError}</p>
                        </div>
                    )}

                    {verifyResult && renderVerdict(verifyResult)}
                </div>

                {/* ═══ Saved Result ═══ */}
                <div className="card p-6" style={{ transform: 'none' }}>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <FileSearch className="w-[18px] h-[18px] text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-white">Saved Result</h2>
                            <p className="text-xs text-zinc-600">Previously stored verification</p>
                        </div>
                    </div>

                    {savedLoading ? (
                        <div className="flex items-center gap-3 p-4 mt-4">
                            <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                            <span className="text-zinc-600 text-sm">Loading...</span>
                        </div>
                    ) : savedError ? (
                        <div className="mt-4 bg-surface rounded-xl border border-white/[0.04] p-4 text-center">
                            <p className="text-zinc-600 text-sm">{savedError}</p>
                        </div>
                    ) : savedResult ? (
                        renderVerdict(savedResult)
                    ) : (
                        <div className="mt-4 bg-surface rounded-xl border border-white/[0.04] p-4 text-center">
                            <p className="text-zinc-600 text-sm">No saved result</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AdminCCTV;
