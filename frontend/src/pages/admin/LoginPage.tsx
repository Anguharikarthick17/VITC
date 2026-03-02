import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, AlertTriangle, Lock, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageTransition from '../../components/PageTransition';
import ThemeToggle from '../../components/ThemeToggle';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setError('');
        setGoogleLoading(true);
        try {
            // For hackathon presentation: 1-click demo login bypass
            await login('admin@gmail.com', 'password123');
            navigate('/admin/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Demo login failed');
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/admin/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-[#0F0F1A] flex relative">
                {/* Theme Toggle - Top Right */}
                <div className="absolute top-6 right-6 z-50">
                    <ThemeToggle />
                </div>

                {/* Left Side - Branding + Video */}
                <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-[#2A2A4A]/50">
                    <video autoPlay loop muted playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen">
                        <source src="https://assets.mixkit.co/videos/preview/mixkit-technology-background-with-hud-and-graphics-31802-large.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F1A]/90 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F1A]/50 to-[#0F0F1A]/90 pointer-events-none" />
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />

                    {/* Logo */}
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(6, 182, 212,0.5)]">
                            <Wrench className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">FixNow Portal</h1>
                    </div>

                    {/* Hero */}
                    <div className="relative z-10 max-w-lg">
                        <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 mb-6 leading-tight">
                            Secure System Administration
                        </h2>
                        <p className="text-lg text-gray-400 leading-relaxed">
                            Access the centralized control panel to manage civic complaints, monitor analytics, and coordinate rapid response teams across the region.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="relative z-10 flex items-center gap-4 text-sm text-gray-500 border-t border-gray-800 pt-6">
                        <p>© 2026 FixNow Systems</p>
                        <span className="w-1 h-1 rounded-full bg-gray-700" />
                        <a href="/dashboard" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                            <ArrowLeft className="w-4 h-4" /> Public Dashboard
                        </a>
                        <span className="w-1 h-1 rounded-full bg-gray-700" />
                        <a href="/report" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                            Report Issue
                        </a>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                    <div className="lg:hidden absolute top-8 left-8 flex items-center gap-4 text-sm text-gray-400">
                        <a href="/dashboard" className="flex items-center gap-2 hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Dashboard
                        </a>
                        <span className="w-1 h-1 rounded-full bg-gray-700" />
                        <a href="/report" className="hover:text-white transition-colors">
                            Report Issue
                        </a>
                    </div>

                    <div className="w-full max-w-lg">
                        {/* Mobile header */}
                        <div className="lg:hidden text-center mb-10">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(6, 182, 212,0.5)]">
                                <Wrench className="w-9 h-9 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">FixNow Portal</h1>
                            <p className="text-gray-500 mt-2">Admin Authentication</p>
                        </div>

                        {/* Card */}
                        <div className="bg-[#1A1A2E]/60 backdrop-blur-xl border border-[#2A2A4A] rounded-3xl p-10 shadow-2xl relative overflow-hidden">
                            {/* Shimmer top */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-70" />

                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-white">Welcome back</h2>
                                <p className="text-sm text-gray-400 mt-1.5">Please enter your credentials to continue</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 text-rose-400 text-sm flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-300">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-400 transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="admin@gmail.com"
                                            className="w-full pl-12 pr-4 py-4 bg-[#0F0F1A]/60 border border-[#2A2A4A] rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 hover:border-gray-600/50 transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-300">Password</label>
                                    <div className="relative group">
                                        <Lock className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-purple-400 transition-colors" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-4 py-4 bg-[#0F0F1A]/60 border border-[#2A2A4A] rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 hover:border-gray-600/50 transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Access Dashboard button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-2xl font-bold text-[15px] bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(6, 182, 212,0.35)] hover:shadow-[0_0_30px_rgba(6, 182, 212,0.55)] transition-all flex items-center justify-center gap-2 mt-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Access Dashboard'
                                    )}
                                </button>

                                {/* OR Divider */}
                                <div className="flex items-center gap-3 py-1">
                                    <div className="flex-1 h-px bg-[#2A2A4A]" />
                                    <span className="text-xs text-gray-600 uppercase tracking-widest">or</span>
                                    <div className="flex-1 h-px bg-[#2A2A4A]" />
                                </div>

                                {/* Sign in with Google */}
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    disabled={googleLoading}
                                    className="w-full py-4 rounded-2xl font-semibold text-sm bg-white/5 border border-[#2A2A4A] hover:bg-white/10 hover:border-gray-500/50 text-gray-200 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                                >
                                    {googleLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                    )}
                                    Sign in with Google
                                </button>

                                <div className="pt-2 text-center">
                                    <p className="text-gray-600 text-xs">
                                        Demo: <span className="text-gray-400 font-mono">admin@gmail.com</span> / <span className="text-gray-400 font-mono">password123</span>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default LoginPage;
