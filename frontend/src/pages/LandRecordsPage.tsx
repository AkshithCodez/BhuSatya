import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { SearchInput, Select } from '../components/ui/Field';
import { EmptyRow, TBody, TD, TH, THead, TR, Table } from '../components/ui/Table';
import { getRecords } from '../data/mockRecords';

const ALL = 'All';

export default function LandRecordsPage() {
  const navigate = useNavigate();
  const records = useMemo(() => getRecords(), []);

  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState(ALL);
  const [recordType, setRecordType] = useState(ALL);
  const [status, setStatus] = useState(ALL);

  const districts = useMemo(
    () => [ALL, ...Array.from(new Set(records.map((r) => r.district))).sort()],
    [records]
  );
  const types = useMemo(
    () => [ALL, ...Array.from(new Set(records.map((r) => r.recordType))).sort()],
    [records]
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records
      .filter((r) => (district === ALL ? true : r.district === district))
      .filter((r) => (recordType === ALL ? true : r.recordType === recordType))
      .filter((r) => (status === ALL ? true : r.status === status))
      .filter(
        (r) =>
          !q ||
          r.recordId.toLowerCase().includes(q) ||
          r.surveyNo.toLowerCase().includes(q) ||
          r.ownerName.toLowerCase().includes(q) ||
          r.village.toLowerCase().includes(q) ||
          r.taluk.toLowerCase().includes(q)
      );
  }, [records, search, district, recordType, status]);

  const reset = () => {
    setSearch('');
    setDistrict(ALL);
    setRecordType(ALL);
    setStatus(ALL);
  };

  return (
    <>
      <PageHeader
        title="Land Records"
        subtitle="The verified register of parcels, owners and survey numbers."
        actions={
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset Filters
          </Button>
        }
      />

      <Panel flush>
        <div className="flex flex-wrap items-center gap-2.5 px-5 py-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by record, survey number, owner or village"
            className="min-w-[260px] flex-1"
          />
          <Select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-[180px]">
            {districts.map((d) => (
              <option key={d} value={d}>
                {d === ALL ? 'All districts' : d}
              </option>
            ))}
          </Select>
          <Select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            className="w-[180px]"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t === ALL ? 'All record types' : t}
              </option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-[160px]">
            <option value={ALL}>All statuses</option>
            <option value="Verified">Verified</option>
            <option value="Under Review">Under Review</option>
            <option value="Flagged">Flagged</option>
          </Select>
        </div>

        <Table minWidth={1060}>
          <THead>
            <TH>Record ID</TH>
            <TH>Survey No.</TH>
            <TH>Owner</TH>
            <TH>Village</TH>
            <TH>Taluk</TH>
            <TH>District</TH>
            <TH>Record Type</TH>
            <TH>Status</TH>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <EmptyRow colSpan={8} message="No land records match the current filters." />
            ) : (
              rows.map((r) => (
                <TR key={r.recordId} onClick={() => navigate(`/land-records/${r.recordId}`)}>
                  <TD className="tnum text-ink font-medium">{r.recordId}</TD>
                  <TD className="tnum">{r.surveyNo}</TD>
                  <TD>{r.ownerName}</TD>
                  <TD>{r.village}</TD>
                  <TD>{r.taluk}</TD>
                  <TD>{r.district}</TD>
                  <TD>{r.recordType}</TD>
                  <TD>
                    <StatusBadge status={r.status} />
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>

        <div className="border-t border-line px-5 py-3.5">
          <p className="tnum text-[12px] text-ink-3">
            Showing {rows.length} of {records.length} records
          </p>
        </div>
      </Panel>
    </>
  );
}
