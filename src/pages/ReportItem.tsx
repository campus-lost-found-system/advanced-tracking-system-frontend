import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem, uploadItemImage, extractFeatures, compareAndSuggest } from '../api/services';
import { Loader2, MapPin, FileText, Tag, Image as ImageIcon, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';

const ReportItem: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        type: 'lost' as 'lost' | 'found',
        location: '',
        description: '',
    });
    const [image, setImage] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [aiProcessing, setAiProcessing] = useState(false);
    const [aiStatusMessage, setAiStatusMessage] = useState('');
    const navigate = useNavigate();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await createItem(formData);
            const itemId = response.data.id;

            if (image) {
                await uploadItemImage(itemId, image);

                setAiProcessing(true);
                const collection = formData.type === 'lost' ? 'lostItems' : 'foundItems';

                setAiStatusMessage('Extracting visual features...');
                await extractFeatures(itemId, collection as 'lostItems' | 'foundItems');

                setAiStatusMessage('Comparing against database items...');
                await compareAndSuggest(itemId, collection as 'lostItems' | 'foundItems');
            }

            alert('Item reported successfully!');
            navigate('/');
        } catch (error: any) {
            console.error('Report submission error:', error);
            const message = error.response?.data?.message || error.message || 'Check your internet connection';
            alert(`Failed to report item: ${message}`);
        } finally {
            setLoading(false);
            setAiProcessing(false);
            setAiStatusMessage('');
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ═══ Item Type Toggle ═══ */}
                    <div className="card p-6" style={{ transform: 'none' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-sm font-bold text-indigo-400">1</div>
                            <h3 className="text-base font-semibold text-white">Item Type</h3>
                        </div>
                        <div className="flex gap-3">
                            {(['lost', 'found'] as const).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type })}
                                    className={`flex-1 py-3 rounded-xl text-sm font-semibold capitalize transition-all ${formData.type === type
                                        ? type === 'lost'
                                            ? 'bg-red-500/10 text-red-300 border border-red-500/25 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                        : 'bg-surface-100 text-zinc-500 border border-white/[0.04] hover:bg-surface-200'
                                        }`}
                                >
                                    {type === 'lost' ? '🔴 Lost Item' : '🟢 Found Item'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ═══ Details ═══ */}
                    <div className="card p-6" style={{ transform: 'none' }}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-sm font-bold text-violet-400">2</div>
                            <h3 className="text-base font-semibold text-white">Item Details</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-2">
                                    <Tag className="w-3.5 h-3.5" /> Title
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="input"
                                    placeholder="e.g., Blue Backpack"
                                />
                            </div>

                            <div>
                                <label htmlFor="location" className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-2">
                                    <MapPin className="w-3.5 h-3.5" /> Location
                                </label>
                                <input
                                    id="location"
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                    className="input"
                                    placeholder="e.g., Library 2nd Floor"
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-2">
                                    <FileText className="w-3.5 h-3.5" /> Description
                                </label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    rows={4}
                                    className="input resize-none"
                                    placeholder="Provide a detailed description of the item..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* ═══ Image Upload ═══ */}
                    <div className="card p-6" style={{ transform: 'none' }}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-sm font-bold text-amber-400">3</div>
                            <h3 className="text-base font-semibold text-white">Photo</h3>
                            <span className="text-xs text-zinc-600 ml-auto">(Optional)</span>
                        </div>

                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-2xl transition-all ${image
                                ? 'border-accent/30 bg-accent/[0.03]'
                                : 'border-white/[0.06] hover:border-accent/20 bg-surface-50/30'
                                }`}
                        >
                            {image ? (
                                <div className="p-4 space-y-3">
                                    <img src={image} alt="Preview" className="max-h-64 mx-auto rounded-xl shadow-card" />
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => setImage('')}
                                            className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="cursor-pointer flex flex-col items-center justify-center py-10 px-6">
                                    <div className="w-14 h-14 rounded-2xl bg-surface-200 flex items-center justify-center mb-3">
                                        <ImageIcon className="w-6 h-6 text-zinc-500" />
                                    </div>
                                    <p className="text-sm font-medium text-zinc-300">Drop an image here or click to upload</p>
                                    <p className="text-xs text-zinc-600 mt-1">PNG, JPG up to 10MB</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* ═══ AI Status ═══ */}
                    {aiProcessing && (
                        <div className="card p-5 flex items-center gap-4 animate-scale-in" style={{ transform: 'none' }}>
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-indigo-300">{aiStatusMessage}</p>
                                <p className="text-xs text-zinc-600 mt-0.5">AI is processing your item image</p>
                            </div>
                        </div>
                    )}

                    {/* ═══ Actions ═══ */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            disabled={loading}
                            className="flex-1 btn-secondary py-3 text-center"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || aiProcessing}
                            className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                        >
                            {(loading || aiProcessing) && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>
                                {aiProcessing ? aiStatusMessage : (loading ? 'Submitting...' : 'Submit Report')}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default ReportItem;
