import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { extractFeatures, compareAndSuggest } from '../api/services';
import Layout from '../components/Layout';
import { ArrowLeft, Cpu, Search, Sparkles, CheckCircle2, XCircle, Loader2, Zap, Eye } from 'lucide-react';

interface FeatureData {
    category?: string;
    colors?: string[];
    shape?: string;
    size_estimate?: string;
    distinctive_features?: string[];
    texture?: string;
}

interface SuggestionItem {
    itemId: string;
    title?: string;
    description?: string;
    zone?: string;
    reportedDate?: string;
    imageUrl?: string;
    score: number;
    matchingAttributes: string[];
    mismatchedAttributes: string[];
    features?: FeatureData;
}

const AdminMatches: React.FC = () => {
    const { itemId } = useParams<{ itemId: string }>();
    const [searchParams] = useSearchParams();
    const collection = (searchParams.get('collection') as 'lostItems' | 'foundItems') || 'lostItems';
    const navigate = useNavigate();

    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [features, setFeatures] = useState<FeatureData | null>(null);
    const [suggestions, setSuggestions] = useState<SuggestionItem[] | null>(null);

    const handleExtractFeatures = async () => {
        if (!itemId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await extractFeatures(itemId, collection);
            setFeatures(res.data || res);
            setStep(1);
        } catch (e: any) {
            setError(e.response?.data?.error || e.message || 'Failed to extract features');
        } finally {
            setLoading(false);
        }
    };

    const handleCompareAndSuggest = async () => {
        if (!itemId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await compareAndSuggest(itemId, collection);
            setSuggestions(res.data || []);
            setStep(2);
        } catch (e: any) {
            setError(e.response?.data?.error || e.message || 'Failed to compare items');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 0.7) return 'from-emerald-500 to-green-600';
        if (score >= 0.5) return 'from-amber-500 to-yellow-600';
        return 'from-red-500 to-orange-600';
    };

    const getScoreBadge = (score: number) => {
        if (score >= 0.7) return { text: 'High', cls: 'badge-approved' };
        if (score >= 0.5) return { text: 'Medium', cls: 'badge-pending' };
        return { text: 'Low', cls: 'badge-rejected' };
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Back */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>

                {/* Item info */}
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <span>Item: <code className="text-zinc-300 bg-surface-200 px-2 py-0.5 rounded-lg text-xs">{itemId}</code></span>
                    <span className="text-zinc-700">·</span>
                    <span>Collection: <span className="text-zinc-300">{collection === 'lostItems' ? 'Lost Items' : 'Found Items'}</span></span>
                </div>

                {/* Step Progress */}
                <div className="flex items-center gap-3">
                    {[
                        { label: 'Extract Features', icon: Eye, done: step >= 1 },
                        { label: 'Compare & Suggest', icon: Search, done: step >= 2 },
                    ].map((s, idx) => (
                        <React.Fragment key={s.label}>
                            {idx > 0 && <div className={`w-12 h-0.5 rounded-full ${s.done ? 'bg-accent/50' : 'bg-surface-300'}`} />}
                            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${s.done
                                    ? 'bg-accent/10 border-accent/20 text-accent-light'
                                    : (step === idx)
                                        ? 'bg-surface-200 border-white/[0.08] text-white'
                                        : 'bg-surface-100 border-white/[0.04] text-zinc-600'
                                }`}>
                                {s.done ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                                <span>{idx + 1}. {s.label}</span>
                            </div>
                        </React.Fragment>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 animate-scale-in">
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="card p-5 flex items-center gap-4 animate-scale-in" style={{ transform: 'none' }}>
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <Loader2 className="w-5 h-5 text-accent-light animate-spin" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-indigo-200">
                                {step === 0 ? 'Analyzing image with Groq Vision AI...' : 'Comparing against all items...'}
                            </p>
                            <p className="text-xs text-zinc-600 mt-0.5">This may take a moment</p>
                        </div>
                    </div>
                )}

                {/* ═══ Step 1: Extract Features ═══ */}
                <div className={`card p-6 ${step === 0 ? '!border-white/[0.08]' : ''}`} style={{ transform: 'none' }}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <Cpu className="w-[18px] h-[18px] text-indigo-400" />
                            </div>
                            <h2 className="text-base font-semibold text-white">Feature Extraction</h2>
                        </div>
                        {step === 0 && (
                            <button onClick={handleExtractFeatures} disabled={loading} className="btn-primary text-xs flex items-center gap-2 py-2.5">
                                <Zap className="w-3.5 h-3.5" /><span>Extract</span>
                            </button>
                        )}
                        {step >= 1 && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    </div>

                    {features && (
                        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3">
                            {features.category && (
                                <div className="bg-surface rounded-xl border border-white/[0.04] p-3">
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Category</p>
                                    <p className="text-white font-medium text-sm">{features.category}</p>
                                </div>
                            )}
                            {features.colors && features.colors.length > 0 && (
                                <div className="bg-surface rounded-xl border border-white/[0.04] p-3">
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Colors</p>
                                    <div className="flex flex-wrap gap-1">
                                        {features.colors.map((c, i) => (
                                            <span key={i} className="badge text-[10px]">{c}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {features.shape && (
                                <div className="bg-surface rounded-xl border border-white/[0.04] p-3">
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Shape</p>
                                    <p className="text-white font-medium text-sm">{features.shape}</p>
                                </div>
                            )}
                            {features.size_estimate && (
                                <div className="bg-surface rounded-xl border border-white/[0.04] p-3">
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Size</p>
                                    <p className="text-white font-medium text-sm">{features.size_estimate}</p>
                                </div>
                            )}
                            {features.texture && (
                                <div className="bg-surface rounded-xl border border-white/[0.04] p-3">
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Texture</p>
                                    <p className="text-white font-medium text-sm">{features.texture}</p>
                                </div>
                            )}
                            {features.distinctive_features && features.distinctive_features.length > 0 && (
                                <div className="bg-surface rounded-xl border border-white/[0.04] p-3 col-span-2 md:col-span-3">
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Distinctive Features</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {features.distinctive_features.map((f, i) => (
                                            <span key={i} className="badge bg-accent/10 text-accent-light border border-accent/20">{f}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ═══ Step 2: Compare & Suggest ═══ */}
                <div className={`card p-6 transition-opacity ${step < 1 ? 'opacity-40' : ''} ${step === 1 ? '!border-white/[0.08]' : ''}`} style={{ transform: 'none' }}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                <Search className="w-[18px] h-[18px] text-violet-400" />
                            </div>
                            <h2 className="text-base font-semibold text-white">Compare & Suggest</h2>
                        </div>
                        {step === 1 && (
                            <button onClick={handleCompareAndSuggest} disabled={loading} className="btn-primary text-xs flex items-center gap-2 py-2.5 !bg-gradient-to-r !from-violet-600 !to-purple-600">
                                <Search className="w-3.5 h-3.5" /><span>Find Matches</span>
                            </button>
                        )}
                        {step >= 2 && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    </div>
                    <p className="text-zinc-600 text-xs mt-2 ml-12">
                        Compares this {collection === 'lostItems' ? 'lost' : 'found'} item against all {collection === 'lostItems' ? 'found' : 'lost'} items with extracted features.
                    </p>
                </div>

                {/* ═══ Suggestions ═══ */}
                {step >= 2 && suggestions !== null && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <h2 className="text-lg font-bold text-white">Top Matches</h2>
                            <span className="badge bg-surface-200 text-zinc-400 border border-white/[0.04]">
                                {suggestions.length} result{suggestions.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {suggestions.length === 0 ? (
                            <div className="card p-12 text-center" style={{ transform: 'none' }}>
                                <p className="text-zinc-500">No matching items found above threshold.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {suggestions.map((s, idx) => {
                                    const badge = getScoreBadge(s.score);
                                    return (
                                        <div key={s.itemId} className="card p-5 animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-xs font-bold text-zinc-600 bg-surface-200 w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        #{idx + 1}
                                                    </span>
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-white">{s.title || s.itemId}</h3>
                                                        {s.description && <p className="text-zinc-600 text-xs mt-1 line-clamp-2">{s.description}</p>}
                                                    </div>
                                                </div>
                                                <span className={`badge ${badge.cls}`}>{badge.text}</span>
                                            </div>

                                            {/* Score */}
                                            <div className="mb-3">
                                                <div className="flex justify-between mb-1.5">
                                                    <span className="text-[11px] text-zinc-500">Match Score</span>
                                                    <span className="text-sm text-white font-bold">{(s.score * 100).toFixed(0)}%</span>
                                                </div>
                                                <div className="w-full bg-surface-300 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(s.score)} transition-all duration-700`}
                                                        style={{ width: `${Math.min(s.score * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Meta */}
                                            <div className="flex items-center gap-4 text-[11px] text-zinc-600 mb-3">
                                                {s.zone && <span>📍 {s.zone}</span>}
                                                {s.reportedDate && <span>📅 {new Date(s.reportedDate).toLocaleDateString()}</span>}
                                            </div>

                                            {/* Attributes */}
                                            <div className="space-y-2">
                                                {s.matchingAttributes.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {s.matchingAttributes.map((a, i) => (
                                                            <span key={i} className="badge badge-approved text-[10px]">✓ {a}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                {s.mismatchedAttributes.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {s.mismatchedAttributes.map((a, i) => (
                                                            <span key={i} className="badge badge-rejected text-[10px]">✗ {a}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminMatches;
