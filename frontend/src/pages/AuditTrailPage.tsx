import { useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { SearchInput, Select } from '../components/ui/Field';
import { EmptyRow, TBody, TD, TH, THead, TR, Table } from '../components/ui/Table';
import { getAuditEvents } from '../api/client';
import type { AuditEvent } from '../types';

export default function AuditTrailPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  const fetchEvents = () => {
    setLoading(true);
    setError(null);
    getAuditEvents()
      .then((res) => {
        setEvents(res.events || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.response?.data?.detail || err.message || 'Failed to load audit trail');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const eventTypes = useMemo(() => {
    const types = new Set(events.map((e) => e.event_type));
    return Array.from(types).sort();
  }, [events]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events
      .filter((e) => (filterType === 'All' ? true : e.event_type === filterType))
      .filter(
        (e) =>
          !q ||
          e.event_type.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.details && e.details.toLowerCase().includes(q)) ||
          (e.document_id && e.document_id.toString().includes(q))
      );
  }, [events, search, filterType]);

  const formatTimestamp = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const getEventBadgeTone = (type: string) => {
    if (type.includes('APPROVED') || type.includes('PASSED')) return 'ok';
    if (type.includes('REJECTED') || type.includes('FAILED')) return 'danger';
    if (type.includes('INVESTIGATION') || type.includes('WARNED') || type.includes('OVERRIDE')) return 'warn';
    return 'accent';
  };

  return (
    <>
      <PageHeader
        title="Audit Trail"
        subtitle="Append-only immutable record of all document events, validations, corrections, and review decisions from PostgreSQL."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchEvents} icon={<RefreshCw size={13} />}>
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch('');
                setFilterType('All');
              }}
            >
              Reset Filters
            </Button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 rounded-card border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <Panel
        flush
        actions={
          <>
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search event type, description or doc ID"
              className="w-[280px]"
            />
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-[180px]">
              <option value="All">All Event Types</option>
              {eventTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </>
        }
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-ink-3">
            <Loader2 className="animate-spin text-accent mb-2" size={24} />
            <p className="text-xs">Loading live audit trail from PostgreSQL...</p>
          </div>
        ) : (
          <Table minWidth={950}>
            <THead>
              <TH>Timestamp</TH>
              <TH>Event Type</TH>
              <TH>Document</TH>
              <TH>Description / Details</TH>
              <TH>User / Actor</TH>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyRow colSpan={5} message="No audit entries match the current filters." />
              ) : (
                rows.map((e) => (
                  <TR key={e.id}>
                    <TD className="tnum whitespace-nowrap text-xs text-ink-3 font-mono">
                      {formatTimestamp(e.created_at)}
                    </TD>
                    <TD>
                      <Badge tone={getEventBadgeTone(e.event_type)}>{e.event_type}</Badge>
                    </TD>
                    <TD className="tnum whitespace-nowrap font-mono text-xs text-ink-2">
                      {e.document_id ? `#${e.document_id}` : 'System'}
                    </TD>
                    <TD className="text-xs text-ink">
                      <div>{e.description}</div>
                      {e.details && (
                        <div className="mt-1 font-mono text-[11px] text-ink-3 break-all bg-black/20 p-1 rounded border border-line/30">
                          {e.details}
                        </div>
                      )}
                    </TD>
                    <TD className="text-xs font-mono text-ink-3">
                      {e.user_id ? `User #${e.user_id}` : 'System'}
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        )}

        <div className="border-t border-line px-5 py-3.5">
          <p className="tnum text-[12px] text-ink-3">
            Showing {rows.length} of {events.length} audit records
          </p>
        </div>
      </Panel>
    </>
  );
}
