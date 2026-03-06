import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Eye, ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { complaintService } from '../../services/supabaseService';

interface Complaint {
    id: string;
    title: string;
    category: string;
    severity: string;
    status: string;
    state: string;
    city: string;
    address: string;
    created_at: string;
    assigned_to: { id: string; name: string } | null;
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

const ComplaintsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [filters, setFilters] = useState({
        status: searchParams.get('status') || '',
        severity: searchParams.get('severity') || '',
        category: searchParams.get('category') || '',
    });
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const fetchComplaints = async (page = 1) => {
        setLoading(true);
        try {
            const f: any = { ...filters, excludeStatus: 'RESOLVED' };
            if (search) f.search = search;

            const data = await complaintService.getComplaints(f, page, 20);
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
        setDateFrom('');
        setDateTo('');
        setSearchParams({});
    };

    // Fetch ALL complaints (up to limit) for export, with optional date filter
    const fetchAllForExport = async (): Promise<Complaint[]> => {
        const f: any = { ...filters };
        const { complaints: list } = await complaintService.getComplaints(f, 1, 1000);
        let result = list || [];
        if (dateFrom) result = result.filter(c => new Date(c.created_at) >= new Date(dateFrom));
        if (dateTo) result = result.filter(c => new Date(c.created_at) <= new Date(dateTo + 'T23:59:59'));
        return result;
    };

    const exportCSV = async () => {
        setExporting(true);
        try {
            const list = await fetchAllForExport();
            const headers = ['ID', 'Title', 'Category', 'Severity', 'Status', 'City', 'State', 'Address', 'Assigned To', 'Created At'];
            const rows = list.map(c => [
                c.id, c.title, c.category.replace(/_/g, ' '), c.severity,
                c.status.replace(/_/g, ' '), c.city, c.state, c.address || '',
                c.assigned_to?.name || 'Unassigned',
                new Date(c.created_at).toLocaleDateString('en-IN'),
            ]);
            const csvContent = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `complaints_${dateFrom || 'all'}_to_${dateTo || 'today'}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setExporting(false);
        }
    };

    const exportPDF = async () => {
        setExporting(true);
        try {
            const list = await fetchAllForExport();
            const doc = new jsPDF({ orientation: 'landscape' });

            doc.setFillColor(15, 15, 26);
            doc.rect(0, 0, 297, 297, 'F');
            doc.setTextColor(6, 182, 212);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('FixNow Portal — Complaints Report', 14, 18);
            doc.setFontSize(10);
            doc.setTextColor(180, 180, 200);
            const range = (dateFrom || dateTo) ? `Date range: ${dateFrom || 'beginning'} → ${dateTo || 'today'}` : 'All dates';
            doc.text(`${range}   |   Total: ${list.length} complaints   |   Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`, 14, 26);

            autoTable(doc, {
                startY: 32,
                head: [['Title', 'Category', 'Severity', 'Status', 'Location', 'Assigned To', 'Date']],
                body: list.map(c => [
                    c.title.substring(0, 45),
                    c.category.replace(/_/g, ' '),
                    c.severity,
                    c.status.replace(/_/g, ' '),
                    `${c.city}, ${c.state}`,
                    c.assigned_to?.name || 'Unassigned',
                    new Date(c.created_at).toLocaleDateString('en-IN'),
                ]),
                styles: { fontSize: 8, cellPadding: 3, textColor: [220, 220, 240], fillColor: [20, 20, 35] },
                headStyles: { fillColor: [6, 60, 80], textColor: [6, 182, 212], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [15, 15, 26] },
                columnStyles: { 2: { fontStyle: 'bold' } },
            });

            doc.save(`complaints_report_${new Date().toISOString().split('T')[0]}.pdf`);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold glow-text">Complaints</h1>
                <div className="flex items-center gap-2">
                    <button onClick={exportCSV} disabled={exporting}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-40"
                        title="Export as CSV">
                        <Download className="w-3.5 h-3.5" />
                        {exporting ? 'Exporting…' : 'CSV'}
                    </button>
                    <button onClick={exportPDF} disabled={exporting}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/40 text-purple-400 hover:bg-purple-500/20 transition-all disabled:opacity-40"
                        title="Export as PDF">
                        <FileText className="w-3.5 h-3.5" />
                        {exporting ? 'Exporting…' : 'PDF'}
                    </button>
                </div>
            </div>

            <div className="glow-panel p-4 bg-black/40 space-y-3">
                <form onSubmit={handleSearch} className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)}
                            className="input-neon input-neon-with-icon py-2 w-full" placeholder="Search by title or ID..." />
                    </div>

                    <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="input-neon py-2 w-36 shrink-0">
                        <option value="" className="bg-[#0A0A12]">All Status</option>
                        <option value="PENDING" className="bg-[#0A0A12]">Pending</option>
                        <option value="IN_PROGRESS" className="bg-[#0A0A12]">In Progress</option>
                        <option value="RESOLVED" className="bg-[#0A0A12]">Resolved</option>
                        <option value="ESCALATED" className="bg-[#0A0A12]">Escalated</option>
                    </select>

                    <select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                        className="input-neon py-2 w-36 shrink-0">
                        <option value="" className="bg-[#0A0A12]">All Severity</option>
                        <option value="LOW" className="bg-[#0A0A12]">Low</option>
                        <option value="MEDIUM" className="bg-[#0A0A12]">Medium</option>
                        <option value="HIGH" className="bg-[#0A0A12]">High</option>
                        <option value="CRITICAL" className="bg-[#0A0A12]">Critical</option>
                    </select>

                    <button type="button" onClick={clearFilters}
                        className="shrink-0 flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                        <Filter className="w-4 h-4" /> Clear
                    </button>
                </form>

                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-cyan-100/50 uppercase tracking-wider font-semibold shrink-0">Export Date Range:</span>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">From</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            className="input-neon py-1.5 px-2 text-xs w-36 [color-scheme:dark]" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">To</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            className="input-neon py-1.5 px-2 text-xs w-36 [color-scheme:dark]" />
                    </div>
                    <span className="text-xs text-cyan-500/60">← used for CSV/PDF export</span>
                </div>
            </div>

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
                                            <td className="py-3 px-4 text-sm text-cyan-100/50">{c.assigned_to?.name || '—'}</td>
                                            <td className="py-3 px-4 text-sm text-cyan-100/50">{new Date(c.created_at).toLocaleDateString()}</td>
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

export default ComplaintsPage;
