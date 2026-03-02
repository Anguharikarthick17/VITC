import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';

interface Complaint {
    id: string;
    title: string;
    category: string;
    severity: string;
    status: string;
    state: string;
    city: string;
    createdAt: string;
    assignedTo: { id: string; name: string } | null;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
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

const HistoryPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [filters, setFilters] = useState({
        status: searchParams.get('status') || '',
        severity: searchParams.get('severity') || '',
        category: searchParams.get('category') || '',
    });

    const fetchComplaints = async (page = 1) => {
        setLoading(true);
        try {
            const params: any = { page, limit: 20, status: 'RESOLVED' };
            if (search) params.search = search;
            if (filters.severity) params.severity = filters.severity;
            if (filters.category) params.category = filters.category;

            const { data } = await api.get('/complaints', { params });
            setComplaints(data.complaints || []);
            setPagination(data.pagination);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchComplaints(); }, [filters]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchComplaints(1);
    };

    const clearFilters = () => {
        setSearch('');
        setFilters({ status: '', severity: '', category: '' });
        setSearchParams({});
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold glow-text">Complaint History</h1>

            {/* Filters */}
            <div className="glow-panel p-4 bg-black/40">
                <div className="flex flex-wrap gap-3 items-center">
                    <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)}
                            className="input-neon input-neon-with-icon py-2" placeholder="Search by title or ID..." />
                    </form>

                    <select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                        className="input-neon w-auto py-2">
                        <option value="" className="bg-[#0A0A12]">All Severity</option>
                        <option value="LOW" className="bg-[#0A0A12]">Low</option>
                        <option value="MEDIUM" className="bg-[#0A0A12]">Medium</option>
                        <option value="HIGH" className="bg-[#0A0A12]">High</option>
                        <option value="CRITICAL" className="bg-[#0A0A12]">Critical</option>
                    </select>

                    <button onClick={clearFilters} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 drop-shadow-[0_0_5px_rgba(34, 211, 238,0.8)]">
                        <Filter className="w-4 h-4" /> Clear
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="glow-panel overflow-hidden bg-black/20">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin shadow-[0_0_10px_rgba(6, 182, 212,0.5)]" />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-xs text-cyan-100/50 uppercase border-b border-cyan-500/20 bg-black/40">
                                        <th className="py-3 px-4 text-left">Title</th>
                                        <th className="py-3 px-4 text-left">Category</th>
                                        <th className="py-3 px-4 text-left">Severity</th>
                                        <th className="py-3 px-4 text-left">Status</th>
                                        <th className="py-3 px-4 text-left">Location</th>
                                        <th className="py-3 px-4 text-left">Assigned</th>
                                        <th className="py-3 px-4 text-left">Date</th>
                                        <th className="py-3 px-4 text-left">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {complaints.map((c) => (
                                        <tr key={c.id} className={`table-row-neon ${c.severity === 'CRITICAL' ? 'bg-red-500/10' : ''}`}>
                                            <td className="py-3 px-4 text-sm text-white max-w-[200px] truncate">{c.title}</td>
                                            <td className="py-3 px-4 text-sm text-cyan-100/50">{c.category.replace(/_/g, ' ')}</td>
                                            <td className="py-3 px-4"><span className={severityBadge(c.severity)}>{c.severity}</span></td>
                                            <td className="py-3 px-4"><span className={statusBadge(c.status)}>{c.status.replace('_', ' ')}</span></td>
                                            <td className="py-3 px-4 text-sm text-cyan-100/50">{c.city}, {c.state}</td>
                                            <td className="py-3 px-4 text-sm text-cyan-100/50">{c.assignedTo?.name || '—'}</td>
                                            <td className="py-3 px-4 text-sm text-cyan-100/50">{new Date(c.createdAt).toLocaleDateString()}</td>
                                            <td className="py-3 px-4">
                                                <Link to={`/admin/complaints/${c.id}`} className="text-cyan-400 hover:text-cyan-300 transition-colors drop-shadow-[0_0_5px_rgba(6, 182, 212,0.8)]">
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {complaints.length === 0 && (
                                        <tr><td colSpan={8} className="py-12 text-center text-cyan-100/50">No complaints found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="p-4 border-t border-cyan-500/20 flex items-center justify-between">
                                <p className="text-sm text-cyan-100/50">
                                    Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                                </p>
                                <div className="flex gap-2">
                                    <button disabled={pagination.page <= 1} onClick={() => fetchComplaints(pagination.page - 1)}
                                        className="btn-neon-secondary py-1.5 px-3 text-sm disabled:opacity-30">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button disabled={pagination.page >= pagination.pages} onClick={() => fetchComplaints(pagination.page + 1)}
                                        className="btn-neon-secondary py-1.5 px-3 text-sm disabled:opacity-30">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;
