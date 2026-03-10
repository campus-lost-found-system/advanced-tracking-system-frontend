import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LogOut, Home, Package, FileText, User, Shield, Menu,
    Search, ChevronRight, Sparkles, ShoppingBag
} from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    const isAdmin = userProfile?.role === 'admin';

    const userNavItems = [
        { path: '/', label: 'Browse Items', icon: Home, color: 'bg-indigo-500/20 text-indigo-400' },
        { path: '/report', label: 'Report Item', icon: Package, color: 'bg-violet-500/20 text-violet-400' },
        { path: '/my-claims', label: 'My Claims', icon: FileText, color: 'bg-emerald-500/20 text-emerald-400' },
        { path: '/shop', label: 'Shop', icon: ShoppingBag, color: 'bg-amber-500/20 text-amber-400' },
        { path: '/profile', label: 'Profile', icon: User, color: 'bg-zinc-500/20 text-zinc-400' },
    ];

    const adminNavItems = [
        { path: '/admin', label: 'Dashboard', icon: Shield, color: 'bg-indigo-500/20 text-indigo-400' },
        { path: '/', label: 'All Items', icon: Home, color: 'bg-violet-500/20 text-violet-400' },
        { path: '/profile', label: 'Profile', icon: User, color: 'bg-amber-500/20 text-amber-400' },
    ];

    const navItems = isAdmin ? adminNavItems : userNavItems;

    // Get page title from path
    const getPageTitle = () => {
        const titles: Record<string, string> = {
            '/': isAdmin ? 'All Items' : 'Browse Items',
            '/report': 'Report Item',
            '/my-claims': 'My Claims',
            '/admin': 'Admin Dashboard',
            '/profile': 'Profile',
            '/shop': 'Shop',
        };
        if (location.pathname.startsWith('/admin/matches')) return 'AI Match Analysis';
        if (location.pathname.startsWith('/admin/cctv')) return 'CCTV Verification';
        if (location.pathname.startsWith('/claims/') && location.pathname.endsWith('/chat')) return 'Claim Chat';
        return titles[location.pathname] || 'Lost & Found';
    };

    return (
        <div className="min-h-screen bg-surface flex">
            {/* ═══ Sidebar ═══ */}
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`
                fixed top-0 left-0 h-full w-[260px] z-50
                glass-strong flex flex-col
                transition-transform duration-300 ease-smooth
                lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo */}
                <div className="p-6 pb-4">
                    <Link to="/" className="flex items-center gap-3 group" onClick={() => setSidebarOpen(false)}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-all">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight">Lost & Found</h1>
                            <p className="text-[11px] text-zinc-500 font-medium tracking-wider uppercase">Suite</p>
                        </div>
                    </Link>
                </div>

                {/* Search (decorative) */}
                <div className="px-4 pb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-9 pr-3 py-2.5 bg-surface-50/50 border border-white/[0.04] rounded-xl text-xs text-zinc-300 placeholder-zinc-600 outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/10 transition-all"
                        />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                    <p className="px-3 pb-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                        Navigation
                    </p>
                    {navItems.map((item) => (
                        <Link
                            key={item.path + item.label}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                        >
                            <div className={`nav-icon ${isActive(item.path) ? 'bg-accent/15 text-accent-light' : item.color}`}>
                                <item.icon className="w-[18px] h-[18px]" />
                            </div>
                            <span>{item.label}</span>
                            {isActive(item.path) && (
                                <ChevronRight className="w-4 h-4 ml-auto text-accent-light/50" />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* User section at bottom */}
                {user && (
                    <div className="p-4 border-t border-white/[0.04]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {(userProfile?.displayName || user.email || 'U')[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-zinc-200 truncate">
                                    {userProfile?.displayName || 'User'}
                                </p>
                                <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-red-400 bg-surface-50/50 hover:bg-red-500/10 border border-white/[0.04] hover:border-red-500/20 transition-all"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                )}
            </aside>

            {/* ═══ Main Content ═══ */}
            <div className="flex-1 lg:ml-[260px] min-h-screen flex flex-col">
                {/* Top Header */}
                <header className="sticky top-0 z-30 glass-strong border-b border-white/[0.04]">
                    <div className="flex items-center justify-between h-16 px-4 lg:px-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-surface-200 transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-lg font-semibold text-white">{getPageTitle()}</h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {isAdmin && (
                                <span className="badge bg-accent/10 text-accent-light border border-accent/20">
                                    Admin
                                </span>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
