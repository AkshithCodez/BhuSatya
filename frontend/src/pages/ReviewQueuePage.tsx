import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReviewQueue, getDocuments } from '../api/client';
import { getRiskColor, getStatusColor, formatDate } from '../utils/helpers';
import type { ReviewQueueItem, DocumentOut } from '../types';

export default function ReviewQueuePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<(ReviewQueueItem | DocumentOut)[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      // First try review queue
      const queue = await getReviewQueue();
      if (queue && queue.length > 0) {
        setItems(queue);
      } else {
        // Fallback to all documents
        const res = await getDocuments();
        setItems(res.documents || []);
      }
    } catch (err) {
      console.error('Failed to load review queue, falling back to docs:', err);
      try {
        const res = await getDocuments();
        setItems(res.documents || []);
      } catch (err2) {
        console.error(err2);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch =
      (item.original_filename?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.village?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.khasra_number?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesRisk = riskFilter === 'ALL' || item.risk_level?.toUpperCase() === riskFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status?.toUpperCase() === statusFilter;

    return matchesSearch && matchesRisk && matchesStatus;
  });

  const highRiskCount = items.filter(i => ['CRITICAL', 'HIGH'].includes(i.risk_level?.toUpperCase() || '')).length;
  const needsReviewCount = items.filter(i => ['REVIEW_REQUIRED', 'VALIDATED'].includes(i.status)).length;
  const readyApprovalCount = items.filter(i => i.status === 'READY_FOR_APPROVAL').length;
  const verifiedCount = items.filter(i => i.status === 'VERIFIED').length;

  return (
    <div className="space-y-6">
      {/* Page Title & Queue Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Officer Verification Queue</h1>
          <p className="text-sm text-slate-500 mt-1">
            Prioritized human-in-the-loop review pipeline for land record anomalies and risk assessments
          </p>
        </div>
        <button
          onClick={fetchQueue}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
        >
          🔄 Refresh Queue
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Review</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{needsReviewCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Documents flagged by AI</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High / Critical Risk</span>
          <p className="text-2xl font-bold text-red-600 mt-1">{highRiskCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Major registry discrepancies</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ready for Approval</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{readyApprovalCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Corrections completed</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Records</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{verifiedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Approved & digitally certified</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search by Document Name, Village, Khasra Number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Risk filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-medium">Risk:</span>
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-medium text-slate-700"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-medium text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="UPLOADED">Uploaded</option>
              <option value="DETECTED">Detected</option>
              <option value="EXTRACTED">Extracted</option>
              <option value="VALIDATED">Validated</option>
              <option value="REVIEW_REQUIRED">Review Required</option>
              <option value="INVESTIGATION_REQUIRED">Investigation Required</option>
              <option value="READY_FOR_APPROVAL">Ready For Approval</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Doc #</th>
                <th className="px-5 py-3">Document Title</th>
                <th className="px-5 py-3">Village / Khasra</th>
                <th className="px-5 py-3">Risk Assessment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Submission Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    Loading review queue records...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No documents found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const risk = getRiskColor(item.risk_level);
                  const isVerified = item.status === 'VERIFIED';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">#{item.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800">{item.original_filename}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {item.village ? (
                          <span>
                            {item.village} • <span className="font-mono font-medium">{item.khasra_number || '—'}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Pending extraction</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {item.risk_level ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold border ${risk.bg} ${risk.text} ${risk.border}`}
                            >
                              {item.risk_level}
                            </span>
                            {item.risk_score !== null && (
                              <span className="text-xs font-mono text-slate-500">{item.risk_score}/100</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Not assessed</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{formatDate(item.created_at)}</td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => navigate(`/documents/${item.id}`)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-100 transition"
                        >
                          View BBoxes
                        </button>
                        <button
                          onClick={() => navigate(`/review/${item.id}`)}
                          className={`px-3 py-1 text-xs font-semibold rounded text-white transition ${
                            isVerified ? 'bg-slate-700 hover:bg-slate-800' : 'bg-emerald-700 hover:bg-emerald-800'
                          }`}
                        >
                          {isVerified ? 'Audit View' : 'Verify Record →'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
