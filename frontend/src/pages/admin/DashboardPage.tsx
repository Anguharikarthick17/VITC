import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText, Clock, Loader, CheckCircle, AlertTriangle,
    TrendingUp, ArrowRight
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import { analyticsService, complaintService } from '../../services/supabaseService';

interface Summary {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    escalated: number;
    critical: number;
}

interface Complaint {
    id: string;
    title: string;
    severity: string;
    status: string;
    state: string;
    created_at: string;
}

const COLORS = ['#EAB308', '#3B82F6', '#22C55E', '#EF4444'];

const DashboardPage: React.FC = () => {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
    const [byCategory, setByCategory] = useState<{ category: string; count: number }[]>([]);
    const [bySeverity, setBySeverity] = useState<{ severity: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [sumData, compData, catData, sevData] = await Promise.all([
                analyticsService.getSummary(),
                complaintService.getComplaints({}, 1, 5),
                analyticsService.getByCategory(),
                analyticsService.getBySeverity(),
            ]);
            setSummary(sumData);
            setRecentComplaints(compData.complaints || []);
            setByCategory(catData as { category: string; count: number }[]);
            setBySeverity(sevData as { severity: string; count: number }[]);
        } catch (err) {
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Auto-refresh every 10 seconds for near real-time updates
        const interval = setInterval(fetchData, 10000);

        // Auto-refresh when user switches back to this tab
        const onFocus = () => fetchData();
        window.addEventListener('focus', onFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', onFocus);
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
        );
    }

    const statCards = [
        { label: 'Total', value: summary?.total || 0, icon: FileText, color: 'text-white' },
        { label: 'Pending', value: summary?.pending || 0, icon: Clock, color: 'text-yellow-400' },
        { label: 'In Progress', value: summary?.inProgress || 0, icon: Loader, color: 'text-blue-400' },
        { label: 'Resolved', value: summary?.resolved || 0, icon: CheckCircle, color: 'text-green-400' },
        { label: 'Escalated', value: summary?.escalated || 0, icon: TrendingUp, color: 'text-orange-400' },
    ];

    const statusBadge = (status: string) => {
        const m: Record<string, string> = {
            PENDING: 'badge-pending', IN_PROGRESS: 'badge-in-progress',
            RESOLVED: 'badge-resolved', ESCALATED: 'badge-escalated',
        };
        return m[status] || 'badge-pending';
    };

    const severityBadge = (s: string) => {
        const m: Record<string, string> = {
            LOW: 'badge-low', MEDIUM: 'badge-medium',
            HIGH: 'badge-high', CRITICAL: 'badge-critical',
        };
        return m[s] || 'badge-low';
    };

    return (
        <div className="flex flex-col gap-3 h-full min-h-0">
            <div className="flex items-center justify-between shrink-0">
                <h1 className="text-xl font-bold glow-text">Dashboard</h1>
                <span className="text-xs text-gray-500">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
            </div>

            {(summary?.critical || 0) > 0 && (
                <div className="glow-panel-critical p-3 flex items-center gap-3 animate-pulse shrink-0">
                    <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.5)] shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <p className="text-red-300 font-semibold text-sm drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]">
                            🚨 {summary?.critical} CRITICAL complaint(s) require immediate attention
                        </p>
                        <Link to="/admin/complaints?severity=CRITICAL" className="text-red-400 text-xs hover:underline flex items-center gap-1 mt-0.5">
                            View critical cases <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-5 gap-3 shrink-0">
                {statCards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="glow-panel p-4 flex flex-col gap-1.5 relative overflow-hidden group">
                        <div className="w-9 h-9 rounded-xl bg-black/40 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_8px_rgba(6,181,211,0.2)] group-hover:shadow-[0_0_15px_rgba(6,181,211,0.5)] transition-all">
                            <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <p className="text-2xl font-bold glow-text">{value}</p>
                        <p className="text-xs text-cyan-100/50 uppercase tracking-wider font-semibold">{label}</p>
                    </div>
                ))}
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">
                <div className="glow-panel p-4 flex flex-col min-h-0">
                    <h3 className="text-sm font-semibold glow-text mb-2 shrink-0">Complaints by Category</h3>
                    <div className="flex-1 min-h-0">
                        {byCategory.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={byCategory}>
                                    <XAxis dataKey="category" tick={{ fill: '#22D3EE', fontSize: 10 }} angle={-30} textAnchor="end" height={55} />
                                    <YAxis tick={{ fill: '#22D3EE', fontSize: 11 }} />
                                    <Tooltip cursor={{ fill: 'rgba(6,181,211,0.1)' }} contentStyle={{ backgroundColor: 'rgba(10,10,18,0.9)', border: '1px solid rgba(6,181,211,0.5)', borderRadius: 8, color: '#22D3EE' }} />
                                    <Bar dataKey="count" fill="#A855F7" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500 text-center py-8 text-sm">No data available</p>
                        )}
                    </div>
                </div>

                <div className="glow-panel p-4 flex flex-col min-h-0">
                    <h3 className="text-sm font-semibold glow-text mb-2 shrink-0">Severity Distribution</h3>
                    <div className="flex-1 min-h-0">
                        {bySeverity.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={bySeverity}
                                        dataKey="count"
                                        nameKey="severity"
                                        cx="50%" cy="50%"
                                        outerRadius="70%"
                                        label={{ fill: '#ffffff', fontWeight: 'bold', fontSize: 12 }}
                                        labelLine={{ stroke: '#22D3EE', strokeWidth: 1 }}
                                    >
                                        {bySeverity.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(10,10,18,0.8)" strokeWidth={2} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,18,0.9)', border: '1px solid rgba(6,181,211,0.5)', borderRadius: 8, color: '#fff' }} itemStyle={{ color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500 text-center py-8 text-sm">No data available</p>
                        )}
                    </div>
                </div>

                <div className="glow-panel flex flex-col overflow-hidden min-h-0">
                    <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-black/20 shrink-0">
                        <h3 className="text-sm font-semibold glow-text">Recent Complaints</h3>
                        <Link to="/admin/complaints" className="text-cyan-400 text-xs hover:text-cyan-300 flex items-center gap-1">
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="overflow-y-auto flex-1 min-h-0">
                        <table className="w-full">
                            <thead className="sticky top-0 z-10">
                                <tr className="text-xs text-cyan-100/50 uppercase border-b border-cyan-500/20 bg-black/60">
                                    <th className="py-2 px-3 text-left">Title</th>
                                    <th className="py-2 px-3 text-left">Sev.</th>
                                    <th className="py-2 px-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentComplaints.map((c) => (
                                    <tr key={c.id} className="table-row-neon">
                                        <td className="py-2 px-3">
                                            <Link to={`/admin/complaints/${c.id}`} className="text-white hover:text-cyan-400 transition-colors text-xs font-medium line-clamp-1">
                                                {c.title}
                                            </Link>
                                        </td>
                                        <td className="py-2 px-3"><span className={`${severityBadge(c.severity)} text-[10px]`}>{c.severity}</span></td>
                                        <td className="py-2 px-3"><span className={`${statusBadge(c.status)} text-[10px]`}>{c.status.replace('_', ' ')}</span></td>
                                    </tr>
                                ))}
                                {recentComplaints.length === 0 && (
                                    <tr><td colSpan={3} className="py-8 text-center text-gray-500 text-xs">No complaints yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
