import React from 'react';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageTransition from './PageTransition';
import {
    Wrench,
    LayoutDashboard,
    FileText,
    BarChart3,
    Users,
    LogOut,
    Menu,
    X,
    Archive,
    Map
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const AdminLayout: React.FC = () => {
    const { user, logout, isLoading } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin/login" />;
    }

    if (user.role === 'OFFICER') {
        if (!location.pathname.startsWith('/admin/complaints')) {
            return <Navigate to="/admin/complaints" replace />;
        }
    }

    const navItems = user.role === 'OFFICER'
        ? [
            { to: '/admin/complaints', icon: FileText, label: 'My Assignments' }
        ]
        : [
            { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/admin/complaints', icon: FileText, label: 'Complaints' },
            { to: '/admin/history', icon: Archive, label: 'History' },
            { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
            { to: '/admin/map', icon: Map, label: 'Map' },
            ...(user.role === 'SUPER_ADMIN'
                ? [{ to: '/admin/users', icon: Users, label: 'Users' }]
                : []),
        ];

    return (
        <PageTransition className="min-h-screen bg-transparent flex flex-col">
            {/* ── Horizontal Top Navbar ── */}
            <header className="glow-panel rounded-none border-x-0 border-t-0 sticky top-0 z-50">
                <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center gap-3">

                    {/* Logo */}
                    <div className="flex items-center gap-2.5 shrink-0 mr-2">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50 shadow-[0_0_15px_rgba(6, 182, 212,0.5)]">
                            <Wrench className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(6, 182, 212,0.8)]" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-base font-bold glow-text leading-none">FixNow Portal</h1>
                            <p className="text-[9px] text-cyan-400 uppercase tracking-widest">Admin Panel</p>
                        </div>
                    </div>

                    {/* Vertical divider */}
                    <div className="hidden lg:block w-px h-6 bg-cyan-500/25 shrink-0" />

                    {/* Nav links – horizontal row on desktop */}
                    <nav className="hidden lg:flex items-center gap-1 flex-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    isActive
                                        ? 'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6, 182, 212,0.35)] transition-all'
                                        : 'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-cyan-100/55 hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all'
                                }
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Spacer (mobile only) */}
                    <div className="flex-1 lg:hidden" />

                    {/* Right: user chip + sign-out */}
                    <div className="hidden lg:flex items-center gap-4 ml-auto shrink-0">
                        <ThemeToggle />
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-cyan-500/30">
                            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold border border-cyan-500/50">
                                {user.name.charAt(0)}
                            </div>
                            <span className="text-cyan-300 text-xs font-medium">{user.name}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34, 211, 238,0.8)] animate-pulse" />
                        </div>

                        <button
                            onClick={logout}
                            title="Sign Out"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-cyan-100/55 hover:text-red-400 border border-transparent hover:border-red-500/40 hover:bg-red-500/10 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden xl:inline">Sign Out</span>
                        </button>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden text-cyan-400 drop-shadow-[0_0_5px_rgba(6, 182, 212,0.8)]"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile dropdown */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-cyan-500/20 bg-black/80 backdrop-blur-xl px-4 py-3 space-y-1">
                        <div className="flex justify-end pb-2 mb-2 border-b border-cyan-500/10">
                            <ThemeToggle />
                        </div>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    isActive
                                        ? 'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                                        : 'flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-cyan-100/55 hover:text-cyan-300 hover:bg-cyan-500/10'
                                }
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </NavLink>
                        ))}
                        <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold border border-cyan-500/50">
                                    {user.name.charAt(0)}
                                </div>
                                <span className="text-cyan-300 text-sm">{user.name}</span>
                            </div>
                            <button onClick={logout} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Page content */}
            <main className="h-[calc(100vh-4rem)] overflow-auto p-4 relative z-10">
                <Outlet />
            </main>
        </PageTransition>
    );
};

export default AdminLayout;
