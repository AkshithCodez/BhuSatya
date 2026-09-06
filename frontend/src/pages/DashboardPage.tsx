import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../api/client';
import { getRiskColor, getStatusColor, formatDate } from '../utils/helpers';
import type { DashboardResponse } from '../types';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard().then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="text-center py-12 text-slate-500">Loading dashboard...</div>;

  const cards = [
    { label: 'Documents Uploaded', value: data.stats.total_documents, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Processed', value: data.stats.processed, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { label: 'Needs Review', value: data.stats.needs_review, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Verified', value: data.stats.verified, color: 'bg-green-50 text-green-700 border-green-200' },
    { label: 'High Risk', value: data.stats.high_risk, color: 'bg-red-50 text-red-700 border-red-200' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className={`p-5 rounded-xl border ${c.color}`}>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-sm mt-1 opacity-80">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Recent Documents</h2>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Document</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Village</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Khasra</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Uploaded</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Risk</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.recent_documents.map(doc => {
              const risk = getRiskColor(doc.risk_level);
              return (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-slate-700">{doc.original_filename}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{doc.village || '—'}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{doc.khasra_number || '—'}</td>
                  <td className="px-6 py-3 text-sm text-slate-500">{formatDate(doc.created_at)}</td>
                  <td className="px-6 py-3">
                    {doc.risk_level && (
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${risk.bg} ${risk.text}`}>
                        {doc.risk_level}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {doc.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
            {data.recent_documents.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-slate-400">No documents uploaded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
