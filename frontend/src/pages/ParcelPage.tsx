import { useState, useEffect } from 'react';
import { getParcels, getParcelTimeline, getParcelGraph } from '../api/client';
import type { ParcelOut, TimelineEvent, GraphNode, GraphEdge } from '../types';

export default function ParcelPage() {
  const [parcels, setParcels] = useState<ParcelOut[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<ParcelOut | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] }>({ nodes: [], edges: [] });
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'map' | 'graph'>('details');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParcels()
      .then(res => {
        setParcels(res || []);
        if (res && res.length > 0) {
          selectParcel(res[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectParcel = async (p: ParcelOut) => {
    setSelectedParcel(p);
    try {
      const tl = await getParcelTimeline(p.id);
      setTimeline(tl.events || []);
    } catch {
      setTimeline([]);
    }
    try {
      const g = await getParcelGraph(p.id);
      setGraphData(g);
    } catch {
      setGraphData({ nodes: [], edges: [] });
    }
  };

  // Convert GIS polygon string/array to normalized SVG polygon points
  const renderCadastralMap = (polygonStr: string | null) => {
    if (!polygonStr) return <div className="text-center py-12 text-slate-400">No GIS survey polygon available</div>;

    let coords: [number, number][] = [];
    try {
      coords = typeof polygonStr === 'string' ? JSON.parse(polygonStr) : polygonStr;
    } catch {
      coords = [[28.61, 77.209], [28.6105, 77.2095], [28.6108, 77.2088], [28.6103, 77.2083]];
    }

    if (coords.length === 0) return null;

    const lats = coords.map(c => c[0]);
    const lngs = coords.map(c => c[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const padLat = (maxLat - minLat) * 0.2 || 0.001;
    const padLng = (maxLng - minLng) * 0.2 || 0.001;

    const svgWidth = 460;
    const svgHeight = 320;

    const points = coords.map(([lat, lng]) => {
      const x = ((lng - (minLng - padLng)) / ((maxLng + padLng) - (minLng - padLng))) * svgWidth;
      const y = svgHeight - (((lat - (minLat - padLat)) / ((maxLat + padLat) - (minLat - padLat))) * svgHeight);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="bg-slate-900 rounded-xl p-4 relative overflow-hidden shadow-inner">
        <div className="absolute top-3 right-3 bg-slate-800/80 text-[10px] text-slate-300 px-2 py-1 rounded border border-slate-700 font-mono">
          Cadastral Survey CRS: WGS84
        </div>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-72">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Polygon */}
          <polygon
            points={points}
            fill="rgba(59, 130, 246, 0.25)"
            stroke="#3b82f6"
            strokeWidth="3"
            className="transition-all hover:fill-blue-500/40"
          />

          {/* Corner points */}
          {coords.map(([lat, lng], idx) => {
            const cx = ((lng - (minLng - padLng)) / ((maxLng + padLng) - (minLng - padLng))) * svgWidth;
            const cy = svgHeight - (((lat - (minLat - padLat)) / ((maxLat + padLat) - (minLat - padLat))) * svgHeight);
            return (
              <g key={idx}>
                <circle cx={cx} cy={cy} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                <text x={cx + 7} y={cy - 5} fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  P{idx + 1}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="flex justify-between items-center text-xs text-slate-400 mt-2 px-1">
          <span>Survey Boundary: {coords.length} vertices</span>
          <span className="text-emerald-400 font-mono">GIS Area: {selectedParcel?.gis_area || '—'} {selectedParcel?.gis_area_unit || 'acre'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Land Records & Cadastral Registry</h1>
        <p className="text-sm text-slate-500 mt-1">
          Authoritative land parcel master registry, ownership share distribution, historical timeline, and spatial GIS boundaries
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Parcel Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
              Registered Parcels ({parcels.length})
            </h2>
            <div className="mt-2 space-y-1.5">
              {loading ? (
                <div className="text-xs text-slate-400 p-3">Loading parcels...</div>
              ) : (
                parcels.map(p => {
                  const isSelected = selectedParcel?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => selectParcel(p)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Khasra No. {p.khasra_number}</span>
                        <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          Khata {p.khata_number}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1">
                        {p.village}, {p.tehsil}, {p.district}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-[11px] text-slate-600 border-t border-slate-100 pt-1.5">
                        <span>Area: <strong className="text-slate-800">{p.area} {p.area_unit}</strong></span>
                        <span>Holders: {p.current_holders?.length || 0}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Parcel Tabs */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          {selectedParcel ? (
            <div>
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 mb-4 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Parcel Khasra {selectedParcel.khasra_number} • {selectedParcel.village}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Khata #{selectedParcel.khata_number} • {selectedParcel.tehsil} Tehsil, {selectedParcel.district} District, {selectedParcel.state}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                  {selectedParcel.area} {selectedParcel.area_unit}
                </span>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 mb-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2 px-3 border-b-2 transition ${
                    activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  📋 Legal Rights & Details
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`pb-2 px-3 border-b-2 transition ${
                    activeTab === 'timeline' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  ⏳ Mutation Timeline ({timeline.length})
                </button>
                <button
                  onClick={() => setActiveTab('map')}
                  className={`pb-2 px-3 border-b-2 transition ${
                    activeTab === 'map' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  🗺️ Cadastral GIS Map
                </button>
                <button
                  onClick={() => setActiveTab('graph')}
                  className={`pb-2 px-3 border-b-2 transition ${
                    activeTab === 'graph' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  🕸️ Land Knowledge Graph
                </button>
              </div>

              {/* Tab 1: Details */}
              {activeTab === 'details' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      <span className="text-slate-500 text-[11px]">RoR Recorded Area</span>
                      <p className="text-sm font-bold text-slate-800 mt-1">{selectedParcel.area} {selectedParcel.area_unit}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      <span className="text-slate-500 text-[11px]">GIS Calculated Area</span>
                      <p className="text-sm font-bold text-emerald-700 mt-1">{selectedParcel.gis_area || selectedParcel.area} {selectedParcel.area_unit}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      <span className="text-slate-500 text-[11px]">Khata Number</span>
                      <p className="text-sm font-bold text-slate-800 mt-1">{selectedParcel.khata_number}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      <span className="text-slate-500 text-[11px]">Khasra Number</span>
                      <p className="text-sm font-bold text-slate-800 mt-1">{selectedParcel.khasra_number}</p>
                    </div>
                  </div>

                  {/* Current Holders Table */}
                  <div className="mt-4">
                    <h3 className="font-semibold text-slate-800 mb-2">Current Certified Land Rights Holders</h3>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                          <tr>
                            <th className="px-4 py-2">Holder / Owner Name</th>
                            <th className="px-4 py-2">Share Fraction</th>
                            <th className="px-4 py-2">Calculated Share Area</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedParcel.current_holders && selectedParcel.current_holders.length > 0 ? (
                            selectedParcel.current_holders.map((h, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="px-4 py-2.5 font-medium text-slate-800">{h.name}</td>
                                <td className="px-4 py-2.5 font-mono text-slate-600">{h.share}</td>
                                <td className="px-4 py-2.5 font-mono text-slate-700">
                                  {selectedParcel.area ? (h.share.includes('/') ? (selectedParcel.area * (parseFloat(h.share.split('/')[0]) / parseFloat(h.share.split('/')[1]))).toFixed(2) : selectedParcel.area) : '—'} {selectedParcel.area_unit}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-4 py-4 text-center text-slate-400">
                                No current holders listed
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Mutation Timeline */}
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Chronological chain of custody and legal mutations affecting this parcel
                  </p>
                  <div className="relative border-l-2 border-blue-200 ml-4 pl-4 space-y-6">
                    {timeline.map((event, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-xs"></span>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-700">{event.year}</span>
                            <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                              {event.event_type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 font-medium mt-1">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: GIS Map */}
              {activeTab === 'map' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Cadastral survey boundary representation mapped from revenue coordinate vertices
                  </p>
                  {renderCadastralMap(selectedParcel.gis_polygon)}
                </div>
              )}

              {/* Tab 4: Knowledge Graph */}
              {activeTab === 'graph' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Entity relationship graph connecting persons, parcels, and mutation instruments
                  </p>
                  <div className="bg-slate-900 rounded-xl p-6 min-h-[300px] flex items-center justify-center relative shadow-inner">
                    <svg viewBox="0 0 500 240" className="w-full h-64">
                      {/* Edges */}
                      {graphData.edges.map((e, idx) => {
                        const fromNode = graphData.nodes.find(n => n.id === e.source);
                        const toNode = graphData.nodes.find(n => n.id === e.target);
                        if (!fromNode || !toNode) return null;
                        return (
                          <g key={idx}>
                            <line
                              x1={idx % 2 === 0 ? 100 : 250}
                              y1={idx % 2 === 0 ? 60 : 180}
                              x2={250}
                              y2={120}
                              stroke="#64748b"
                              strokeWidth="2"
                              strokeDasharray="4 2"
                            />
                            <text
                              x={idx % 2 === 0 ? 160 : 260}
                              y={idx % 2 === 0 ? 80 : 160}
                              fill="#94a3b8"
                              fontSize="9"
                              fontFamily="sans-serif"
                            >
                              {e.label}
                            </text>
                          </g>
                        );
                      })}

                      {/* Nodes */}
                      {graphData.nodes.map((node, idx) => {
                        const isParcel = node.type === 'parcel';
                        const isPerson = node.type === 'person';
                        const cx = isParcel ? 250 : idx * 140 + 70;
                        const cy = isParcel ? 120 : idx % 2 === 0 ? 50 : 190;
                        const color = isParcel ? '#2563eb' : isPerson ? '#059669' : '#d97706';

                        return (
                          <g key={node.id}>
                            <circle cx={cx} cy={cy} r="22" fill={color} stroke="#ffffff" strokeWidth="2" />
                            <text
                              x={cx}
                              y={cy + 34}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="10"
                              fontWeight="600"
                              fontFamily="sans-serif"
                            >
                              {node.label}
                            </text>
                            <text
                              x={cx}
                              y={cy + 45}
                              textAnchor="middle"
                              fill="#94a3b8"
                              fontSize="8"
                              fontFamily="monospace"
                            >
                              {node.type}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">Select a parcel on the left to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}
