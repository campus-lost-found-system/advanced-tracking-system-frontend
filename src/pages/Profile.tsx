import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile, getMyItems, updateItem, deleteItem, Item } from '../api/services';
import { User, Mail, Shield, IdCard, Save, Loader2, Pencil, Trash2, X, Check, AlertCircle, Package, MapPin } from 'lucide-react';
import Layout from '../components/Layout';

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [saveError, setSaveError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        displayName: '',
        phoneNumber: ''
    });

    const [myItems, setMyItems] = useState<Item[]>([]);
    const [itemsLoading, setItemsLoading] = useState(true);
    const [itemsError, setItemsError] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', location: '' });
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
        fetchMyItems();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await getProfile();
            setProfile(response.data);
            setFormData({
                displayName: response.data.displayName || '',
                phoneNumber: response.data.phoneNumber || ''
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            setProfileError('Failed to load profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyItems = async () => {
        setItemsLoading(true);
        setItemsError(null);
        try {
            const response = await getMyItems();
            setMyItems(response.data || []);
        } catch (error) {
            console.error('Failed to fetch my items:', error);
            setItemsError('Failed to load your items.');
        } finally {
            setItemsLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMsg('');
        setSaveError(null);
        try {
            await updateProfile(formData);
            setSuccessMsg('Profile updated successfully!');
            setTimeout(() => {
                setSuccessMsg('');
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Failed to update profile:', error);
            setSaveError('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const startEditing = (item: Item) => {
        setEditingItem(item.id);
        setEditForm({ title: item.title, description: item.description, location: item.location });
    };

    const cancelEditing = () => {
        setEditingItem(null);
        setEditForm({ title: '', description: '', location: '' });
    };

    const handleUpdateItem = async (itemId: string) => {
        setEditLoading(true);
        try {
            await updateItem(itemId, editForm);
            setEditingItem(null);
            await fetchMyItems();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update item');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        setDeleteLoading(itemId);
        try {
            await deleteItem(itemId);
            await fetchMyItems();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete item');
        } finally {
            setDeleteLoading(null);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-8">
                {profileError && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{profileError}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ═══ Sidebar ═══ */}
                    <div className="space-y-6">
                        {/* Avatar Card */}
                        <div className="card p-6 text-center" style={{ transform: 'none' }}>
                            <div className="relative inline-block mb-4">
                                <div className="w-24 h-24 rounded-2xl bg-surface-50 border border-surface-100 flex items-center justify-center shadow-sm mx-auto">
                                    <User className="w-12 h-12 text-primary" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-primary border-2 border-surface flex items-center justify-center">
                                    <Check className="w-3 h-3 text-surface" />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-primary">{profile?.displayName || 'User'}</h2>
                            <p className="text-sm text-text-muted capitalize mt-1">{profile?.role || 'Member'}</p>
                        </div>

                        {/* Account Details */}
                        <div className="card p-5 space-y-4" style={{ transform: 'none' }}>
                            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest">Account</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-surface-50 border border-surface-100 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-sm text-text-secondary truncate">{profile?.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-surface-50 border border-surface-100 flex items-center justify-center flex-shrink-0">
                                        <IdCard className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-sm text-text-secondary">{profile?.campusId || profile?.uid?.slice(0, 8)}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-surface-50 border border-surface-100 flex items-center justify-center flex-shrink-0">
                                        <Shield className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-sm text-text-secondary capitalize">{profile?.role} Account</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══ Main Settings ═══ */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleUpdate} className="card overflow-hidden" style={{ transform: 'none' }}>
                            <div className="p-5 border-b border-surface-100">
                                <h3 className="text-base font-semibold text-primary">Personal Information</h3>
                                <p className="text-xs text-text-muted mt-1">Update your public profile</p>
                            </div>

                            <div className="p-5 space-y-5">
                                {successMsg && (
                                    <div className="bg-surface-50 border border-surface-100 text-primary px-4 py-3 rounded-xl text-sm animate-scale-in">
                                        ✓ {successMsg}
                                    </div>
                                )}

                                {saveError && (
                                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{saveError}</span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        className="input"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-2">Phone Number<span className="text-text-muted ml-1">(Optional)</span></label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="input"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>

                            <div className="p-5 border-t border-surface-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {saving ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></>
                                    ) : (
                                        <><Save className="w-4 h-4" /><span>Save Changes</span></>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* ═══ My Reported Items ═══ */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-primary">My Reported Items</h2>
                        <span className="badge bg-surface-50 text-text-muted border border-surface-100">
                            {myItems.length} items
                        </span>
                    </div>

                    {itemsError && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{itemsError}</span>
                        </div>
                    )}

                    {itemsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28" />)}
                        </div>
                    ) : myItems.length === 0 ? (
                        <div className="card p-12 text-center" style={{ transform: 'none' }}>
                            <div className="w-14 h-14 rounded-2xl bg-surface-50 border border-surface-100 flex items-center justify-center mx-auto mb-3">
                                <Package className="w-7 h-7 text-text-muted" />
                            </div>
                            <p className="text-text-muted text-sm">You haven't reported any items yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myItems.map((item, idx) => (
                                <div key={item.id} className="card p-4 animate-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
                                    {editingItem === item.id ? (
                                        <div className="space-y-3">
                                            <input type="text" value={editForm.title}
                                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                className="input text-sm" placeholder="Title" />
                                            <input type="text" value={editForm.location}
                                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                                className="input text-sm" placeholder="Location" />
                                            <textarea value={editForm.description}
                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                rows={2} className="input text-sm resize-none" placeholder="Description" />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleUpdateItem(item.id)} disabled={editLoading}
                                                    className="btn-success text-xs flex items-center gap-1.5 py-2">
                                                    {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                    <span>Save</span>
                                                </button>
                                                <button onClick={cancelEditing}
                                                    className="btn-secondary text-xs flex items-center gap-1.5 py-2">
                                                    <X className="w-3.5 h-3.5" /><span>Cancel</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <h3 className="text-sm font-semibold text-primary truncate">{item.title}</h3>
                                                    <span className={`badge text-[10px] ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>{item.type}</span>
                                                    <span className={`badge text-[10px] ${item.status === 'returned' ? 'badge-approved' : 'badge-pending'}`}>{item.status}</span>
                                                </div>
                                                <p className="text-xs text-text-secondary line-clamp-2 mb-1.5">{item.description}</p>
                                                <div className="flex items-center gap-1 text-[11px] text-text-muted">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{item.location}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5 flex-shrink-0">
                                                <button onClick={() => startEditing(item)}
                                                    className="p-2 rounded-xl text-text-muted hover:text-primary hover:bg-surface-50 transition-colors" title="Edit">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDeleteItem(item.id)}
                                                    disabled={deleteLoading === item.id}
                                                    className="p-2 rounded-xl text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50" title="Delete">
                                                    {deleteLoading === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
