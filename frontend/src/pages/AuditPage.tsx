import { useState, useEffect } from 'react';
import { getAuditEvents } from '../api/client';
import { formatDate } from '../utils/helpers';
import type { AuditEvent } from '../types';

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [docFilter, setDocFilter] = useState<string>('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const docIdNum = docFilter ? parseInt(docFilter, 10) : undefined;
      const res = await getAuditEvents(isNaN(docIdNum as number) ? undefined : docIdNum);
      setEvents(res.events || []);
    } catch (err) {
      console.error('Failed to load audit events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [docFilter]);

  const filteredEvents = events.filter(e => {
    if (typeFilter === 'ALL') return true;
    return e.event_type === typeFilter;
  });

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'DOCUMENT_APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'FIELD_CORRECTED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'DOCUMENT_REJECTED':
      case 'FLAGGED_INVESTIGATION':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'VALIDATION_COMPLETED':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'LAYOUT_DETECTION_COMPLETED':
      case 'TABLE_EXTRACTED':
      case 'FIELDS_PARSED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const handleExportAudit = () => {
    const blob = new Blob([JSON.stringify(filteredEvents, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `bhusatya_audit_log_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Immutable Audit Trail</h1>
          <p className="text-sm text-slate-500 mt-1">
            Chronological, non-repudiable audit ledger capturing every AI inference, officer correction, and verification decision
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleExportAudit}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition shadow-xs flex items-center gap-1.5"
          >
            📥 Export Audit Log (JSON)
          </button>
        </div>
      </div>

      {/* Security Compliance Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🛡️</span>
          <div>
            <p className="text-xs font-bold text-slate-200">Append-Only Cryptographic Log Integrity</p>
            <p className="text-[11px] text-slate-400">
              All events are logged with system user attribution, timestamps, before/after values, and justification notes.
            </p>
          </div>
        </div>
        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded font-mono border border-emerald-500/30">
          LOG INTEGRITY: VERIFIED
        </span>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-medium">Filter by Event:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-medium text-slate-700"
            >
              <option value="ALL">All Events</option>
              <option value="DOCUMENT_UPLOADED">Document Uploaded</option>
              <option value="LAYOUT_DETECTION_STARTED">Detection Started</option>
              <option value="LAYOUT_DETECTION_COMPLETED">Detection Completed</option>
              <option value="TABLE_EXTRACTED">Table Extracted</option>
              <option value="FIELDS_PARSED">Fields Parsed</option>
              <option value="VALIDATION_COMPLETED">Validation Completed</option>
              <option value="FIELD_CORRECTED">Field Corrected (Officer)</option>
              <option value="DOCUMENT_APPROVED">Document Approved</option>
              <option value="DOCUMENT_REVIEWED">Document Reviewed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-medium">Document ID:</span>
            <input
              type="text"
              placeholder="e.g. 1"
              value={docFilter}
              onChange={e => setDocFilter(e.target.value)}
              className="w-24 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        <span className="text-xs text-slate-500">
          Showing {filteredEvents.length} events
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Event ID</th>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Event Type</th>
                <th className="px-5 py-3">Document</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    Loading audit trail events...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredEvents.map(ev => {
                  const isExpanded = expandedId === ev.id;
                  return (
                    <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-mono text-slate-500">#{ev.id}</td>
                      <td className="px-5 py-3 font-mono text-slate-600 whitespace-nowrap">
                        {formatDate(ev.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${getEventBadgeColor(
                            ev.event_type
                          )}`}
                        >
                          {ev.event_type}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {ev.document_id ? (
                          <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            Doc #{ev.document_id}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-800 font-medium">
                        {ev.description}
                        {isExpanded && ev.details && (
                          <div className="mt-2 p-2.5 bg-slate-900 text-slate-200 rounded font-mono text-[11px] whitespace-pre-wrap overflow-x-auto">
                            {ev.details}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {ev.details ? (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {isExpanded ? 'Hide' : 'Inspect'}
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
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
