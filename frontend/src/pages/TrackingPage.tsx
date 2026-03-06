import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Wrench, Search, Clock, AlertTriangle, ArrowLeft, User } from 'lucide-react';
import { complaintService } from '../services/supabaseService';
import PageTransition from '../components/PageTransition';

interface TimelineEntry {
    action: string;
    performed_by: { name: string; role: string } | null;
    timestamp: string;
}

interface ComplaintData {
    id: string;
    title: string;
    category: string;
    severity: string;
    status: string;
    state: string;
    city: string;
    address: string;
    assigned_to: { name: string; role: string } | null;
    created_at: string;
    updated_at: string;
    logs: TimelineEntry[];
}

const statusBadge = (status: string) => {
    const classes: Record<string, string> = {
        PENDING: 'badge-pending',
        IN_PROGRESS: 'badge-in-progress',
        RESOLVED: 'badge-resolved',
        ESCALATED: 'badge-escalated',
    };
    return classes[status] || 'badge-pending';
};

const severityBadge = (severity: string) => {
    const classes: Record<string, string> = {
        LOW: 'badge-low',
        MEDIUM: 'badge-medium',
        HIGH: 'badge-high',
        CRITICAL: 'badge-critical',
    };
    return classes[severity] || 'badge-low';
};

const TrackingPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [complaintId, setComplaintId] = useState(searchParams.get('id') || '');
    const [complaint, setComplaint] = useState<ComplaintData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (searchParams.get('id')) {
            performSearch(searchParams.get('id') || '');
        }
    }, [searchParams]);

    const performSearch = async (id: string) => {
        if (!id.trim()) return;
        setLoading(true);
        setError('');
        setComplaint(null);

        try {
            const data = await complaintService.trackComplaint(id.trim());
            setComplaint(data);
        } catch (err: any) {
            setError(err.message || 'Complaint not found. Please check the ID.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(complaintId);
    };

    return (
        <PageTransition className="min-h-screen bg-transparent">
            <header className="glow-panel rounded-none border-x-0 border-t-0">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50 shadow-[0_0_15px_rgba(6, 182, 212,0.5)]">
                            <Wrench className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6, 182, 212,0.8)]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold glow-text tracking-tight">FixNow Portal</h1>
                            <p className="text-xs text-cyan-400 font-medium drop-shadow-[0_0_5px_rgba(6, 182, 212,0.5)]">Track Complaint</p>
                        </div>
                    </div>
                    <Link to="/" className="flex items-center gap-2 text-cyan-400/70 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34, 211, 238,0.8)] transition-all text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-12 relative z-10">
                <form onSubmit={handleSearch} className="glow-panel p-6 flex gap-3">
                    <input
                        value={complaintId}
                        onChange={(e) => setComplaintId(e.target.value)}
                        placeholder="Enter your Complaint ID"
                        className="input-neon flex-1"
                    />
                    <button type="submit" disabled={loading} className="btn-neon flex items-center gap-2">
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Search className="w-5 h-5" />
                        )}
                        Search
                    </button>
                </form>

                {error && (
                    <div className="mt-6 bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-cyan-400" />
                        <p className="text-cyan-400 text-sm">{error}</p>
                    </div>
                )}

                {complaint && (
                    <div className="mt-8 space-y-6">
                        <div className="glow-panel p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                <div>
                                    <h2 className="text-xl font-bold glow-text mb-1">{complaint.title}</h2>
                                    <p className="text-sm text-cyan-100/50 font-mono">ID: {complaint.id}</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className={statusBadge(complaint.status)}>{complaint.status.replace('_', ' ')}</span>
                                    <span className={severityBadge(complaint.severity)}>{complaint.severity}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-cyan-500/20">
                                <div>
                                    <p className="text-xs text-cyan-100/50 uppercase">Category</p>
                                    <p className="text-sm text-white mt-1 drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]">{complaint.category.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-cyan-100/50 uppercase">Location</p>
                                    <p className="text-sm text-white mt-1 drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]">{complaint.city}, {complaint.state}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-cyan-100/50 uppercase">Date Filed</p>
                                    <p className="text-sm text-white mt-1 drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]">{new Date(complaint.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-cyan-100/50 uppercase">Assigned Officer</p>
                                    <p className="text-sm text-white mt-1 flex items-center gap-1 drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]">
                                        {complaint.assigned_to ? (
                                            <><User className="w-3 h-3 text-cyan-400" /> {complaint.assigned_to.name}</>
                                        ) : (
                                            <span className="text-cyan-100/50">Unassigned</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glow-panel p-6">
                            <h3 className="text-lg font-semibold glow-text mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_5px_rgba(6, 182, 212,0.8)]" /> Timeline
                            </h3>
                            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/50 before:to-transparent">
                                {complaint.logs.map((entry, i) => (
                                    <div key={i} className="flex gap-4 relative z-10">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_rgba(6, 182, 212,0.8)] ${i === 0 ? 'bg-cyan-400 animate-pulse' : 'bg-cyan-500/30 border border-cyan-500/50'}`} />
                                            {i < complaint.logs.length - 1 && <div className="w-0.5 flex-1 bg-cyan-500/20" />}
                                        </div>
                                        <div className="pb-6">
                                            <p className="text-white text-sm font-medium drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]">{entry.action}</p>
                                            <p className="text-xs text-cyan-100/50 mt-1">
                                                {entry.performed_by?.name || 'System'} · {new Date(entry.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default TrackingPage;
