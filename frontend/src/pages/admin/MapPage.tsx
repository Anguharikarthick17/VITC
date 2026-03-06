import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon } from 'lucide-react';
import { complaintService } from '../../services/supabaseService';

// Fix leaflet default icon issue with bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

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
}

// Approximate lat/lng lookup for Indian states
const STATE_COORDS: Record<string, [number, number]> = {
    'Andhra Pradesh': [15.9129, 79.74],
    'Arunachal Pradesh': [27.1, 93.6],
    'Assam': [26.2, 92.9],
    'Bihar': [25.09, 85.31],
    'Chhattisgarh': [21.27, 81.86],
    'Goa': [15.29, 74.12],
    'Gujarat': [22.25, 71.19],
    'Haryana': [29.05, 76.09],
    'Himachal Pradesh': [31.1, 77.17],
    'Jharkhand': [23.61, 85.27],
    'Karnataka': [15.31, 75.71],
    'Kerala': [10.85, 76.27],
    'Madhya Pradesh': [22.97, 78.65],
    'Maharashtra': [19.66, 75.3],
    'Manipur': [24.66, 93.9],
    'Meghalaya': [25.46, 91.36],
    'Mizoram': [23.16, 92.93],
    'Nagaland': [26.15, 94.56],
    'Odisha': [20.94, 84.8],
    'Punjab': [31.14, 75.34],
    'Rajasthan': [27.02, 74.21],
    'Sikkim': [27.53, 88.51],
    'Tamil Nadu': [11.12, 78.65],
    'Telangana': [18.11, 79.0],
    'Tripura': [23.94, 91.98],
    'Uttar Pradesh': [26.84, 80.94],
    'Uttarakhand': [30.06, 79.54],
    'West Bengal': [22.98, 87.85],
    'Delhi': [28.7, 77.1],
    'Chandigarh': [30.73, 76.78],
};

const SEVERITY_COLOR: Record<string, string> = {
    LOW: '#22C55E',
    MEDIUM: '#F59E0B',
    HIGH: '#F97316',
    CRITICAL: '#EF4444',
};

const MapPage: React.FC = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'pins' | 'heatmap'>('pins');
    const [filterSeverity, setFilterSeverity] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const data = await complaintService.getComplaints({}, 1, 500);
                setComplaints(data.complaints || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const filtered = complaints.filter(c => {
        if (filterSeverity && c.severity !== filterSeverity) return false;
        if (filterStatus && c.status !== filterStatus) return false;
        return true;
    });

    // Group by state for heatmap circles
    const byState = filtered.reduce<Record<string, number>>((acc, c) => {
        acc[c.state] = (acc[c.state] || 0) + 1;
        return acc;
    }, {});
    const maxCount = Math.max(...Object.values(byState), 1);

    return (
        <div className="flex flex-col gap-4 h-full min-h-0">
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <MapIcon className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6, 182, 212,0.8)]" />
                    <h1 className="text-2xl font-bold glow-text">Complaint Map</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-black/40 border border-cyan-500/30 rounded-lg p-1">
                        <button onClick={() => setViewMode('pins')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'pins' ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6, 182, 212,0.4)]' : 'text-gray-400 hover:text-gray-200'}`}>
                            📍 Pin View
                        </button>
                        <button onClick={() => setViewMode('heatmap')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'heatmap' ? 'bg-orange-500/20 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'text-gray-400 hover:text-gray-200'}`}>
                            🔥 Heatmap
                        </button>
                    </div>
                    <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
                        className="input-neon py-1.5 px-2 text-xs w-32">
                        <option value="" className="bg-[#0A0A12]">All Severity</option>
                        <option value="LOW" className="bg-[#0A0A12]">Low</option>
                        <option value="MEDIUM" className="bg-[#0A0A12]">Medium</option>
                        <option value="HIGH" className="bg-[#0A0A12]">High</option>
                        <option value="CRITICAL" className="bg-[#0A0A12]">Critical</option>
                    </select>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="input-neon py-1.5 px-2 text-xs w-36">
                        <option value="" className="bg-[#0A0A12]">All Status</option>
                        <option value="PENDING" className="bg-[#0A0A12]">Pending</option>
                        <option value="IN_PROGRESS" className="bg-[#0A0A12]">In Progress</option>
                        <option value="RESOLVED" className="bg-[#0A0A12]">Resolved</option>
                        <option value="ESCALATED" className="bg-[#0A0A12]">Escalated</option>
                    </select>
                    <span className="text-xs text-cyan-500/60">{filtered.length} complaints</span>
                </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                {viewMode === 'pins' ? (
                    <>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Severity:</span>
                        {Object.entries(SEVERITY_COLOR).map(([k, v]) => (
                            <span key={k} className="flex items-center gap-1.5 text-xs text-gray-300">
                                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: v, boxShadow: `0 0 6px ${v}` }} />
                                {k}
                            </span>
                        ))}
                    </>
                ) : (
                    <span className="text-xs text-gray-400">Circle size & colour intensity = number of complaints in that state</span>
                )}
            </div>

            <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-cyan-500/30 shadow-[0_0_20px_rgba(6, 182, 212,0.15)]" style={{ minHeight: '400px' }}>
                {loading ? (
                    <div className="flex items-center justify-center h-full bg-[#0A0A12]">
                        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <MapContainer
                        center={[20.59, 78.96]}
                        zoom={5}
                        style={{ height: '100%', width: '100%', background: '#0A0A12' }}
                        scrollWheelZoom
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                        />

                        {viewMode === 'pins' && filtered.map((c) => {
                            const coords = STATE_COORDS[c.state];
                            if (!coords) return null;
                            const jitter = (): [number, number] => [
                                coords[0] + (Math.random() - 0.5) * 2,
                                coords[1] + (Math.random() - 0.5) * 2,
                            ];
                            const pos = jitter();
                            const color = SEVERITY_COLOR[c.severity] || '#06B6D4';
                            return (
                                <CircleMarker
                                    key={c.id}
                                    center={pos}
                                    radius={c.severity === 'CRITICAL' ? 10 : c.severity === 'HIGH' ? 8 : 6}
                                    pathOptions={{
                                        color,
                                        fillColor: color,
                                        fillOpacity: 0.75,
                                        weight: 2,
                                    }}
                                >
                                    <Popup>
                                        <div style={{ fontFamily: 'sans-serif', minWidth: '180px' }}>
                                            <strong style={{ color: '#06B6D4' }}>{c.title}</strong>
                                            <div style={{ marginTop: '6px', fontSize: '12px', lineHeight: '1.8' }}>
                                                <div>📍 {c.city}, {c.state}</div>
                                                <div>🏷️ {c.category.replace(/_/g, ' ')}</div>
                                                <div style={{ color: SEVERITY_COLOR[c.severity], fontWeight: 'bold' }}>⚠️ {c.severity}</div>
                                                <div>📋 {c.status.replace(/_/g, ' ')}</div>
                                                <div style={{ color: '#888' }}>📅 {new Date(c.created_at).toLocaleDateString('en-IN')}</div>
                                            </div>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            );
                        })}

                        {viewMode === 'heatmap' && Object.entries(byState).map(([state, count]) => {
                            const coords = STATE_COORDS[state];
                            if (!coords) return null;
                            const intensity = count / maxCount;
                            const r = Math.round(intensity * 255);
                            const g = Math.round((1 - intensity) * 180);
                            const color = `rgb(${r}, ${g}, 30)`;
                            const radius = 20 + intensity * 40;
                            return (
                                <CircleMarker
                                    key={state}
                                    center={coords}
                                    radius={radius}
                                    pathOptions={{
                                        color,
                                        fillColor: color,
                                        fillOpacity: 0.45,
                                        weight: 1.5,
                                    }}
                                >
                                    <Popup>
                                        <div>
                                            <strong style={{ color: '#06B6D4' }}>{state}</strong>
                                            <div style={{ fontSize: '13px', marginTop: '4px' }}>
                                                🔥 <strong>{count}</strong> complaint{count > 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            );
                        })}
                    </MapContainer>
                )}
            </div>
        </div>
    );
};

export default MapPage;
