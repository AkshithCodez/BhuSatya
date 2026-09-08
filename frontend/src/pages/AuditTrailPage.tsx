import { useMemo, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { SearchInput, Select } from '../components/ui/Field';
import { EmptyRow, TBody, TD, TH, THead, TR, Table } from '../components/ui/Table';
import { getAuditLogs } from '../data/mockAuditLogs';

export default function AuditTrailPage() {
  const logs = useMemo(() => getAuditLogs(), []);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs
      .filter((l) => (status === 'All' ? true : l.status === status))
      .filter(
        (l) =>
          !q ||
          l.officer.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.caseOrRecord.toLowerCase().includes(q)
      );
  }, [logs, search, status]);

  return (
    <>
      <PageHeader
        title="Audit Trail"
        subtitle="Every officer action recorded against a case or land record."
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('');
              setStatus('All');
            }}
          >
            Reset Filters
          </Button>
        }
      />

      <Panel
        flush
        actions={
          <>
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search officer, action or case"
              className="w-[260px]"
            />
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-[160px]">
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Approved">Approved</option>
              <option value="Flagged">Flagged</option>
            </Select>
          </>
        }
      >
        <Table minWidth={900}>
          <THead>
            <TH>Timestamp</TH>
            <TH>Officer</TH>
            <TH>Action</TH>
            <TH>Case / Record</TH>
            <TH>Status</TH>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <EmptyRow colSpan={5} message="No audit entries match the current filters." />
            ) : (
              rows.map((l) => (
                <TR key={l.id}>
                  <TD className="tnum whitespace-nowrap text-ink-3">{l.timestamp}</TD>
                  <TD className="whitespace-nowrap">{l.officer}</TD>
                  <TD className="text-ink">
                    {l.action}
                    {l.notes && <span className="mt-1 block text-[12px] text-ink-3">{l.notes}</span>}
                  </TD>
                  <TD className="tnum whitespace-nowrap">{l.caseOrRecord}</TD>
                  <TD>
                    <StatusBadge status={l.status} />
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>

        <div className="border-t border-line px-5 py-3.5">
          <p className="tnum text-[12px] text-ink-3">
            Showing {rows.length} of {logs.length} entries
          </p>
        </div>
      </Panel>
    </>
  );
}
