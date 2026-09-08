import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  FileCheck2,
  FileSearch,
  FileStack,
  Map,
  Upload,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import BarChart from '../components/ui/BarChart';
import SegmentedControl from '../components/ui/SegmentedControl';
import { StatusBadge } from '../components/ui/Badge';
import { SearchInput, Select } from '../components/ui/Field';
import { EmptyRow, TBody, TD, TH, THead, TR, Table } from '../components/ui/Table';
import { getCases } from '../data/mockCases';

type Period = 'week' | 'month' | 'quarter';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
];

/** Reporting figures per period — the single source for cards and chart. */
const FIGURES: Record<Period, { processed: number; pending: number; verified: number; stages: number[] }> = {
  week: { processed: 34, pending: 18, verified: 2480, stages: [34, 29, 6, 23] },
  month: { processed: 142, pending: 18, verified: 2480, stages: [142, 124, 18, 96] },
  quarter: { processed: 411, pending: 18, verified: 2480, stages: [411, 380, 41, 318] },
};

const STAGE_LABELS = ['Uploaded', 'Analysed', 'Awaiting review', 'Approved'];

const QUICK_ACTIONS = [
  {
    icon: Upload,
    title: 'Upload Document',
    help: 'Add a scanned deed, RTC or mutation record.',
    to: '/upload',
  },
  {
    icon: FileSearch,
    title: 'Document Analysis',
    help: 'Inspect detected text, tables, signatures and stamps.',
    to: '/analysis',
  },
  {
    icon: ClipboardCheck,
    title: 'Verification Cases',
    help: 'Review cases awaiting an officer decision.',
    to: '/verification',
  },
  {
    icon: Map,
    title: 'Land Records',
    help: 'Search the verified land record register.',
    to: '/land-records',
  },
];

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('month');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  const cases = useMemo(() => getCases(), []);
  const figures = FIGURES[period];

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cases
      .filter((c) => (status === 'All' ? true : c.status === status))
      .filter(
        (c) =>
          !q ||
          c.id.toLowerCase().includes(q) ||
          c.docType.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q) ||
          c.surveyNo.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [cases, search, status]);

  const resetFilters = () => {
    setPeriod('month');
    setSearch('');
    setStatus('All');
  };

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Summary of land-record digitization and verification activity."
        actions={
          <>
            <SegmentedControl options={PERIODS} value={period} onChange={setPeriod} />
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
          </>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          accent
          icon={<FileStack size={16} strokeWidth={1.9} />}
          label="Processed Records"
          value={figures.processed.toLocaleString('en-IN')}
          description="Documents digitized and analysed in this period."
          action={{ label: 'View analysis', onClick: () => navigate('/analysis') }}
        />
        <StatCard
          icon={<ClipboardCheck size={16} strokeWidth={1.9} />}
          label="Pending Verification"
          value={figures.pending.toLocaleString('en-IN')}
          description="Cases awaiting an officer decision."
          action={{ label: 'Open case queue', onClick: () => navigate('/verification') }}
        />
        <StatCard
          icon={<FileCheck2 size={16} strokeWidth={1.9} />}
          label="Verified Land Records"
          value={figures.verified.toLocaleString('en-IN')}
          description="Records confirmed against the state register."
          action={{ label: 'Browse records', onClick: () => navigate('/land-records') }}
        />
      </div>

      {/* Quick actions + activity */}
      <div className="mt-5 grid grid-cols-1 xl:grid-cols-12 gap-5">
        <Panel
          title="Quick Actions"
          subtitle="Jump straight into the four everyday tasks."
          className="xl:col-span-7"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(({ icon: Icon, title, help, to }) => (
              <button
                key={to}
                type="button"
                onClick={() => navigate(to)}
                className="group rounded-ctl border border-line bg-raised p-4 text-left transition-colors hover:bg-raised-2 hover:border-line-strong"
              >
                <span className="grid place-items-center h-8 w-8 rounded-ctl bg-panel text-ink-2 transition-colors group-hover:text-ink">
                  <Icon size={16} strokeWidth={1.9} />
                </span>
                <p className="mt-3 text-[13.5px] font-medium text-ink">{title}</p>
                <p className="mt-1 text-[12px] text-ink-3 leading-snug">{help}</p>
              </button>
            ))}
          </div>
        </Panel>

        <Panel
          title="Processing Activity"
          subtitle={`Document stages · ${PERIODS.find((p) => p.value === period)?.label}`}
          className="xl:col-span-5"
        >
          <BarChart
            data={STAGE_LABELS.map((label, i) => ({ label, value: figures.stages[i] }))}
            accentIndex={3}
            height={176}
          />
        </Panel>
      </div>

      {/* Recent cases */}
      <Panel
        flush
        className="mt-5"
        title="Recent Verification Cases"
        actions={
          <>
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cases"
              className="w-[210px]"
            />
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-[150px]">
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
            <TH>Case</TH>
            <TH>Document Type</TH>
            <TH>District</TH>
            <TH>Survey No.</TH>
            <TH>Updated</TH>
            <TH>Status</TH>
            <TH align="right">Action</TH>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <EmptyRow colSpan={7} message="No cases match the current filters." />
            ) : (
              rows.map((c) => (
                <TR key={c.id} onClick={() => navigate(`/verification/${c.id}`)}>
                  <TD className="tnum text-ink font-medium">{c.id}</TD>
                  <TD>{c.docType}</TD>
                  <TD>{c.district}</TD>
                  <TD className="tnum">{c.surveyNo}</TD>
                  <TD className="text-ink-3">{c.updatedAt}</TD>
                  <TD>
                    <StatusBadge status={c.status} />
                  </TD>
                  <TD align="right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/verification/${c.id}`);
                      }}
                    >
                      Review
                    </Button>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </Panel>
    </>
  );
}
