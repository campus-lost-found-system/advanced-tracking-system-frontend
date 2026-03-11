import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem, uploadItemImage, extractFeatures, compareAndSuggest } from '../api/services';
import { Loader2, MapPin, FileText, Tag, Upload } from 'lucide-react';
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
                            <div className="w-8 h-8 rounded-lg bg-surface-50 border border-surface-100 flex items-center justify-center text-sm font-bold text-primary">1</div>
                            <h3 className="text-base font-semibold text-primary">Item Type</h3>
                        </div>
                        <div className="flex gap-3">
                            {(['lost', 'found'] as const).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type })}
                                    className={`flex-1 py-3 rounded-xl text-sm font-semibold capitalize transition-all ${formData.type === type
                                        ? 'bg-primary text-surface border border-primary shadow-[0_2px_10px_rgba(0,0,0,0.08)]'
                                        : 'bg-surface-50 text-text-secondary border border-surface-100 hover:bg-surface-100'
                                        }`}
                                >
                                    {type === 'lost' ? 'Lost Item' : 'Found Item'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ═══ Details ═══ */}
                    <div className="card p-6" style={{ transform: 'none' }}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-surface-50 border border-surface-100 flex items-center justify-center text-sm font-bold text-primary">2</div>
                            <h3 className="text-base font-semibold text-primary">Item Details</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-text-muted mb-2">
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
                                <label htmlFor="location" className="flex items-center gap-2 text-sm font-medium text-text-muted mb-2">
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
                                <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-text-muted mb-2">
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
                            <div className="w-8 h-8 rounded-lg bg-surface-50 border border-surface-100 flex items-center justify-center text-sm font-bold text-primary">3</div>
                            <h3 className="text-base font-semibold text-primary">Photo</h3>
                            <span className="text-xs text-text-muted ml-auto">(Optional)</span>
                        </div>

                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-2xl transition-all ${image
                                ? 'border-primary/30 bg-surface-50'
                                : 'border-surface-200 hover:border-surface-300 bg-surface-50/50'
                                }`}
                        >
                            {image ? (
                                <div className="p-4 space-y-3">
                                    <img src={image} alt="Preview" className="max-h-64 mx-auto rounded-xl shadow-card" />
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => setImage('')}
                                            className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="cursor-pointer flex flex-col items-center justify-center py-10 px-6">
                                    <div className="w-14 h-14 rounded-2xl bg-surface-50 flex items-center justify-center mb-3">
                                        <Upload className="w-6 h-6 text-text-muted" />
                                    </div>
                                    <p className="text-sm font-medium text-primary">Drop an image here or click to upload</p>
                                    <p className="text-xs text-text-muted mt-1">PNG, JPG up to 10MB</p>
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
                            <div className="w-10 h-10 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center flex-shrink-0">
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-primary">{aiStatusMessage}</p>
                                <p className="text-xs text-text-muted mt-0.5">AI is processing your item image</p>
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
