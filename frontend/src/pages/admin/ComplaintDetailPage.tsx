import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Clock, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface Officer {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface LogEntry {
    id: string;
    action: string;
    performedBy: { name: string; role: string } | null;
    timestamp: string;
}

interface ComplaintData {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: string;
    status: string;
    state: string;
    city: string;
    address: string;
    contact: string;
    email: string;
    image: string | null;
    notes: string | null;
    assignedTo: { id: string; name: string; role: string; email: string } | null;
    assignedToId: string | null;
    createdAt: string;
    updatedAt: string;
    logs: LogEntry[];
}

const statusBadge = (s: string) => {
    const m: Record<string, string> = {
        PENDING: 'badge-pending', IN_PROGRESS: 'badge-in-progress',
        RESOLVED: 'badge-resolved', ESCALATED: 'badge-escalated',
    };
    return m[s] || 'badge-pending';
};

const severityBadge = (s: string) => {
    const m: Record<string, string> = {
        LOW: 'badge-low', MEDIUM: 'badge-medium',
        HIGH: 'badge-high', CRITICAL: 'badge-critical',
    };
    return m[s] || 'badge-low';
};

const ComplaintDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [complaint, setComplaint] = useState<ComplaintData | null>(null);
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');
    const [assignedToId, setAssignedToId] = useState('');
    const [notes, setNotes] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [compRes, offRes] = await Promise.all([
                    api.get(`/complaints/${id}`),
                    api.get('/users/officers'),
                ]);
                setComplaint(compRes.data);
                setOfficers(offRes.data);
                setStatus(compRes.data.status);
                setAssignedToId(compRes.data.assignedToId || '');
                setNotes(compRes.data.notes || '');
            } catch {
                navigate('/admin/complaints');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleUpdate = async () => {
        setSaving(true);
        setMessage('');
        try {
            const payload: any = {};
            if (status !== complaint?.status) payload.status = status;
            if (assignedToId !== (complaint?.assignedToId || '')) payload.assignedToId = assignedToId || null;
            if (notes !== (complaint?.notes || '')) payload.notes = notes;

            const { data } = await api.patch(`/complaints/${id}`, payload);
            setComplaint({ ...complaint!, ...data, logs: complaint!.logs });
            setMessage('Updated successfully');

            // Refresh logs
            const refreshed = await api.get(`/complaints/${id}`);
            setComplaint(refreshed.data);
        } catch (err: any) {
            setMessage(err.response?.data?.error || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this complaint?')) return;
        try {
            await api.delete(`/complaints/${id}`);
            navigate('/admin/complaints');
        } catch (err: any) {
            setMessage(err.response?.data?.error || 'Delete failed');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!complaint) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/complaints')} className="text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold glow-text drop-shadow-[0_0_8px_rgba(34, 211, 238,0.8)]">{complaint.title}</h1>
                    <p className="text-xs text-gray-500 font-mono mt-1">ID: {complaint.id}</p>
                </div>
                <span className={severityBadge(complaint.severity)}>{complaint.severity}</span>
                <span className={statusBadge(complaint.status)}>{complaint.status.replace('_', ' ')}</span>
            </div>

            {complaint.severity === 'CRITICAL' && (
                <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-cyan-400" />
                    <p className="text-cyan-300 text-sm font-medium">🚨 This is a CRITICAL complaint requiring immediate attention</p>
                </div>
            )}

            {message && (
                <div className={`rounded-lg p-3 text-sm ${message.includes('success') ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'}`}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glow-panel p-6">
                        <h3 className="text-lg font-semibold glow-text mb-4">Complaint Details</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-cyan-500/80 uppercase mb-1 font-semibold tracking-wider">Description</p>
                                <p className="text-gray-300 text-sm leading-relaxed">{complaint.description}</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-[#2A2A4A]">
                                <div><p className="text-xs text-cyan-500/80 uppercase font-semibold tracking-wider">Category</p><p className="text-sm text-cyan-50 mt-1 font-medium">{complaint.category.replace(/_/g, ' ')}</p></div>
                                <div><p className="text-xs text-cyan-500/80 uppercase font-semibold tracking-wider">State</p><p className="text-sm text-cyan-50 mt-1 font-medium">{complaint.state}</p></div>
                                <div><p className="text-xs text-cyan-500/80 uppercase font-semibold tracking-wider">City</p><p className="text-sm text-cyan-50 mt-1 font-medium">{complaint.city}</p></div>
                                <div><p className="text-xs text-cyan-500/80 uppercase font-semibold tracking-wider">Address</p><p className="text-sm text-cyan-50 mt-1 font-medium">{complaint.address}</p></div>
                                <div><p className="text-xs text-cyan-500/80 uppercase font-semibold tracking-wider">Contact</p><p className="text-sm text-cyan-50 mt-1 font-medium">{complaint.contact}</p></div>
                                <div><p className="text-xs text-cyan-500/80 uppercase font-semibold tracking-wider">Email</p><p className="text-sm text-cyan-50 mt-1 font-medium">{complaint.email}</p></div>
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    {complaint.image && (
                        <div className="glow-panel p-6">
                            <h3 className="text-lg font-semibold glow-text mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-cyan-400" /> Uploaded Image
                            </h3>
                            <img src={`/uploads/${complaint.image}`} alt="Complaint" className="rounded-lg max-h-96 w-full object-contain bg-black/20" />
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="glow-panel p-6">
                        <h3 className="text-lg font-semibold glow-text mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-cyan-400" /> Activity Log
                        </h3>
                        <div className="space-y-0">
                            {complaint.logs.map((log, i) => (
                                <div key={log.id} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-cyan-500' : 'bg-[#2A2A4A]'}`} />
                                        {i < complaint.logs.length - 1 && <div className="w-0.5 flex-1 bg-[#2A2A4A]" />}
                                    </div>
                                    <div className="pb-5">
                                        <p className="text-white text-sm">{log.action}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {log.performedBy?.name || 'System'} · {new Date(log.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Side Panel - Actions */}
                <div className="space-y-6">
                    <div className="glow-panel p-6 space-y-4">
                        <h3 className="text-lg font-semibold glow-text">Actions</h3>

                        <div>
                            <label className="block text-xs font-semibold tracking-wide text-cyan-400/80 uppercase mb-2">Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-neon bg-black/40">
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="ESCALATED">Escalated</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold tracking-wide text-cyan-400/80 uppercase mb-2">Assign Officer</label>
                            <select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} disabled={user?.role === 'OFFICER'} className="input-neon bg-black/40 disabled:opacity-50">
                                <option value="">Unassigned</option>
                                {officers.map((o) => (
                                    <option key={o.id} value={o.id}>{o.name} ({o.role.replace('_', ' ')})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold tracking-wide text-cyan-400/80 uppercase mb-2">Internal Notes</label>
                            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
                                className="input-neon bg-black/40 resize-none" placeholder="Add internal notes..." />
                        </div>

                        <button onClick={handleUpdate} disabled={saving} className="btn-neon w-full flex items-center justify-center gap-2">
                            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>

                        {user?.role === 'SUPER_ADMIN' && (
                            <button onClick={handleDelete} className="w-full py-2.5 px-6 rounded-lg border border-red-500/50 text-red-400 text-sm hover:bg-red-500/20 hover:border-red-400 hover:shadow-[0_0_15px_rgba(248,113,113,0.3)] transition-all flex items-center justify-center gap-2">
                                <Trash2 className="w-4 h-4" /> Delete Complaint
                            </button>
                        )}
                    </div>

                    {/* Info Card */}
                    <div className="glow-panel p-6 space-y-3">
                        <h4 className="text-sm font-semibold text-cyan-400/80 uppercase tracking-widest">Metadata</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Created</span><span className="text-white">{new Date(complaint.createdAt).toLocaleString()}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Updated</span><span className="text-white">{new Date(complaint.updatedAt).toLocaleString()}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Currently</span><span className={statusBadge(complaint.status)}>{complaint.status.replace('_', ' ')}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetailPage;
