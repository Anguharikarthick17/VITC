import React, { useEffect, useState } from 'react';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Clock } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    LineChart, Line, CartesianGrid,
} from 'recharts';
import api from '../../services/api';

const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#22C55E', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#06B6D4'];

const AnalyticsPage: React.FC = () => {
    const [byState, setByState] = useState<{ state: string; count: number }[]>([]);
    const [byCategory, setByCategory] = useState<{ category: string; count: number }[]>([]);
    const [bySeverity, setBySeverity] = useState<{ severity: string; count: number }[]>([]);
    const [daily, setDaily] = useState<{ date: string; count: number }[]>([]);
    const [resolution, setResolution] = useState({ averageHours: 0, count: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [stateRes, catRes, sevRes, dailyRes, resRes] = await Promise.all([
                    api.get('/analytics/by-state'),
                    api.get('/analytics/by-category'),
                    api.get('/analytics/by-severity'),
                    api.get('/analytics/daily'),
                    api.get('/analytics/resolution-time'),
                ]);
                setByState(stateRes.data);
                setByCategory(catRes.data);
                setBySeverity(sevRes.data);
                setDaily(dailyRes.data);
                setResolution(resRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Analytics</h1>

            {/* Resolution Time Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="stat-card">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{resolution.averageHours}h</p>
                    <p className="text-sm text-gray-500">Average Resolution Time</p>
                </div>
                <div className="stat-card">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{resolution.count}</p>
                    <p className="text-sm text-gray-500">Complaints Resolved</p>
                </div>
            </div>

            {/* Daily Line Chart */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" /> Complaints Per Day (Last 30 Days)
                </h3>
                {daily.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={daily}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A4A" />
                            <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                            <YAxis tick={{ fill: '#9CA3AF' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid #2A2A4A', borderRadius: 8, color: '#fff' }} />
                            <Line type="monotone" dataKey="count" stroke="#DC2626" strokeWidth={2} dot={{ fill: '#DC2626', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-500 text-center py-12">No data for the last 30 days</p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* By State Bar Chart */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-cyan-400" /> Complaints by State
                    </h3>
                    {byState.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={byState} layout="vertical">
                                <XAxis type="number" tick={{ fill: '#9CA3AF' }} />
                                <YAxis dataKey="state" type="category" tick={{ fill: '#9CA3AF', fontSize: 11 }} width={120} />
                                <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid #2A2A4A', borderRadius: 8, color: '#fff' }} />
                                <Bar dataKey="count" fill="#DC2626" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No data available</p>
                    )}
                </div>

                {/* By Category Pie Chart */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-cyan-400" /> Complaints by Category
                    </h3>
                    {byCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={byCategory} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={100}
                                    label={(entry: any) => `${String(entry.category || entry.name || '').replace(/_/g, ' ')}: ${entry.count ?? entry.value}`}>
                                    {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid #2A2A4A', borderRadius: 8, color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No data available</p>
                    )}
                </div>
            </div>

            {/* Severity Distribution */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Severity Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {bySeverity.map((item) => {
                        const colors: Record<string, { bg: string; text: string; border: string }> = {
                            LOW: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
                            MEDIUM: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
                            HIGH: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
                            CRITICAL: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
                        };
                        const c = colors[item.severity] || colors.LOW;
                        return (
                            <div key={item.severity} className={`p-4 rounded-lg ${c.bg} border ${c.border} text-center`}>
                                <p className={`text-2xl font-bold ${c.text}`}>{item.count}</p>
                                <p className="text-xs text-gray-500 mt-1 uppercase">{item.severity}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
