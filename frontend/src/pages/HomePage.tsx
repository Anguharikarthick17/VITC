import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, AlertTriangle, Upload, Send, Shield, Activity, FileText } from 'lucide-react';
import api from '../services/api';
import PageTransition from '../components/PageTransition';
import ThemeToggle from '../components/ThemeToggle';

const CATEGORIES = [
    { value: 'ROAD_DAMAGE', label: 'Road Damage' },
    { value: 'WATER_SUPPLY', label: 'Water Supply' },
    { value: 'ELECTRICITY', label: 'Electricity' },
    { value: 'SANITATION', label: 'Sanitation' },
    { value: 'PUBLIC_SAFETY', label: 'Public Safety' },
    { value: 'NOISE_POLLUTION', label: 'Noise Pollution' },
    { value: 'ILLEGAL_CONSTRUCTION', label: 'Illegal Construction' },
    { value: 'GARBAGE', label: 'Garbage' },
    { value: 'TRAFFIC', label: 'Traffic' },
    { value: 'STREET_LIGHTING', label: 'Street Lighting' },
    { value: 'PARK_MAINTENANCE', label: 'Park Maintenance' },
    { value: 'DRAINAGE_FLOODING', label: 'Drainage / Flooding' },
    { value: 'AIR_POLLUTION', label: 'Air Pollution' },
    { value: 'ANIMAL_CONTROL', label: 'Animal Control' },
    { value: 'PUBLIC_TRANSPORT', label: 'Public Transport' },
    { value: 'BUILDING_SAFETY', label: 'Building Safety' },
    { value: 'FIRE_HAZARD', label: 'Fire Hazard' },
    { value: 'OTHER', label: 'Other' },
];

const SEVERITIES = [
    { value: 'LOW', label: 'Low', color: 'text-gray-400' },
    { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-400' },
    { value: 'HIGH', label: 'High', color: 'text-orange-400' },
    { value: 'CRITICAL', label: '🚨 CRITICAL', color: 'text-cyan-400' },
];

const STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Chandigarh',
];

const LiveClock = () => {
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="hidden md:flex flex-col items-end justify-center mr-4 text-right">
            <span className="text-cyan-400 font-bold text-sm tracking-wide drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">
                {time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </span>
            <span className="text-cyan-100/60 text-[10px] uppercase font-semibold tracking-wider">
                {time.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })} (IST)
            </span>
        </div>
    );
};

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [form, setForm] = useState({
        title: '', description: '', category: '', severity: '',
        state: '', city: '', address: '', contact: '', email: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                setError('Only JPG and PNG images are allowed.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be less than 5MB.');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, val]) => formData.append(key, val));
            if (imageFile) formData.append('image', imageFile);

            const { data } = await api.post('/complaints', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            navigate(`/success/${data.id}`);
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Failed to submit complaint.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageTransition className="min-h-screen bg-transparent text-white selection:bg-cyan-500/30">
            {/* Header */}
            <header className="glow-panel rounded-none border-x-0 border-t-0 sticky top-0 z-50">
                <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-16 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50 shadow-[0_0_15px_rgba(6, 182, 212,0.5)]">
                            <Wrench className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6, 182, 212,0.8)]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold glow-text tracking-tight">FixNow Portal</h1>
                            <p className="text-xs text-cyan-400 font-medium drop-shadow-[0_0_5px_rgba(6, 182, 212,0.5)]">Emergency Complaint System</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <LiveClock />
                        <a href="/track" className="btn-neon-secondary text-sm">Track Complaint</a>
                        <a href="/admin/login" className="flex items-center gap-2 text-sm text-cyan-400/70 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34, 211, 238,0.8)] transition-all">
                            <Shield className="w-4 h-4" /> Admin
                        </a>
                        <div className="ml-2 pl-2 border-l border-cyan-500/20 flex items-center">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="w-full max-w-[1600px] mx-auto px-6 lg:px-12 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 relative z-10">
                {/* Left Side: Hero Info */}
                <div className="flex flex-col justify-center sticky top-28 h-fit">
                    <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full px-4 py-2 mb-6 w-fit">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-cyan-400 text-sm font-medium">Report civic emergencies instantly</span>
                    </div>
                    <h2 className="text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
                        Report a <br className="hidden lg:block" />
                        <span className="glow-text text-cyan-400">Civic Complaint</span>
                    </h2>
                    <p className="text-cyan-100/70 text-lg lg:text-xl max-w-xl drop-shadow-[0_0_5px_rgba(255,255,255,0.2)] mb-10 leading-relaxed">
                        Your voice matters. Report issues in your area and help make your community safer and better. Our emergency response team receives and addresses these reports promptly.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                        <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition-all group">
                            <Wrench className="w-10 h-10 text-cyan-500/70 group-hover:text-cyan-400 mb-4 transition-colors drop-shadow-[0_0_8px_rgba(6, 182, 212,0.8)]" />
                            <h3 className="font-bold text-white text-lg mb-2">Fast Resolution</h3>
                            <p className="text-sm text-cyan-100/60 leading-relaxed">Connects your complaints directly with the appropriate city action teams.</p>
                        </div>
                        <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition-all group">
                            <Shield className="w-10 h-10 text-cyan-500/70 group-hover:text-cyan-400 mb-4 transition-colors drop-shadow-[0_0_8px_rgba(6, 182, 212,0.8)]" />
                            <h3 className="font-bold text-white text-lg mb-2">Secure Tracking</h3>
                            <p className="text-sm text-cyan-100/60 leading-relaxed">Track your complaint status anonymously using your unique tracking ID.</p>
                        </div>
                        <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition-all group">
                            <FileText className="w-10 h-10 text-cyan-500/70 group-hover:text-cyan-400 mb-4 transition-colors drop-shadow-[0_0_8px_rgba(6, 182, 212,0.8)]" />
                            <h3 className="font-bold text-white text-lg mb-2">How It Works</h3>
                            <p className="text-sm text-cyan-100/60 leading-relaxed">Submit a report, get an ID, and administrators will dispatch the nearest team.</p>
                        </div>
                        <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition-all group">
                            <Activity className="w-10 h-10 text-cyan-500/70 group-hover:text-cyan-400 mb-4 transition-colors drop-shadow-[0_0_8px_rgba(6, 182, 212,0.8)]" />
                            <h3 className="font-bold text-white text-lg mb-2">Live Statistics</h3>
                            <p className="text-sm text-cyan-100/60 leading-relaxed">Over 500+ issues resolved locally. Join the movement to keep your city safe.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full max-w-[800px] mx-auto lg:mx-0 lg:ml-auto">
                    <form onSubmit={handleSubmit} className="glow-panel p-8 lg:p-12 space-y-8">
                        {error && (
                            <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-4 flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                                <p className="text-cyan-400 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-cyan-100/70 mb-2">Complaint Title *</label>
                            <input name="title" value={form.title} onChange={handleChange} required
                                className="input-neon" placeholder="Brief title describing the issue" />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-cyan-100/70 mb-2">Description *</label>
                            <textarea name="description" value={form.description} onChange={handleChange} required
                                rows={4} className="input-neon resize-none" placeholder="Detailed description of the problem..." />
                        </div>

                        {/* Category + Severity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-cyan-100/70 mb-2">Category *</label>
                                <select name="category" value={form.category} onChange={handleChange} required className="input-neon">
                                    <option value="" className="bg-[#0A0A12]">Select category</option>
                                    {CATEGORIES.map((c) => <option key={c.value} value={c.value} className="bg-[#0A0A12]">{c.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-cyan-100/70 mb-2">Severity *</label>
                                <select name="severity" value={form.severity} onChange={handleChange} required className="input-neon">
                                    <option value="" className="bg-[#0A0A12]">Select severity</option>
                                    {SEVERITIES.map((s) => <option key={s.value} value={s.value} className="bg-[#0A0A12]">{s.label}</option>)}
                                </select>
                            </div>
                        </div>

                        {form.severity === 'CRITICAL' && (
                            <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-4 animate-pulse">
                                <p className="text-cyan-300 text-sm font-medium flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    🚨 CRITICAL severity will trigger emergency protocols and immediate admin notification.
                                </p>
                            </div>
                        )}

                        {/* Location */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-cyan-100/70 mb-2">State *</label>
                                <select name="state" value={form.state} onChange={handleChange} required className="input-neon">
                                    <option value="" className="bg-[#0A0A12]">Select state</option>
                                    {STATES.map((s) => <option key={s} value={s} className="bg-[#0A0A12]">{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-cyan-100/70 mb-2">City *</label>
                                <input name="city" value={form.city} onChange={handleChange} required
                                    className="input-neon" placeholder="Enter city" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-cyan-100/70 mb-2">Address *</label>
                                <input name="address" value={form.address} onChange={handleChange} required
                                    className="input-neon" placeholder="Enter nearest address/landmark" />
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-cyan-100/70 mb-2">Contact Number *</label>
                                <input name="contact" value={form.contact} onChange={handleChange} required
                                    type="tel" className="input-neon" placeholder="10-digit phone number" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-cyan-100/70 mb-2">Email *</label>
                                <input name="email" value={form.email} onChange={handleChange} required
                                    type="email" className="input-neon" placeholder="your@email.com" />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-cyan-100/70 mb-2">Upload Image (Optional)</label>
                            <div
                                className="border-2 border-dashed border-cyan-500/30 bg-black/40 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6, 182, 212,0.3)] transition-all group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <div className="space-y-3">
                                        <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-[0_0_10px_rgba(6, 182, 212,0.4)]" />
                                        <p className="text-sm text-cyan-400">Click to change image</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Upload className="w-10 h-10 text-cyan-500/50 mx-auto group-hover:text-cyan-400 transition-colors drop-shadow-[0_0_5px_rgba(6, 182, 212,0.5)]" />
                                        <p className="text-cyan-100/70 group-hover:glow-text">Click to upload an image</p>
                                        <p className="text-xs text-cyan-500/50">JPG or PNG, max 5MB</p>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png"
                                    className="hidden" onChange={handleImageChange} />
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={isSubmitting}
                            className="btn-neon w-full flex items-center justify-center gap-2 py-4 text-lg">
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" /> Submit Complaint
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </PageTransition>
    );
};

export default HomePage;
