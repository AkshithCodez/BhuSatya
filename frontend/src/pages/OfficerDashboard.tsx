import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  FileCheck2,
  FileSearch,
  FileStack,
  Map,
  Upload,
  AlertTriangle,
  Loader2,
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
import { getDashboard } from '../api/client';
import type { DashboardResponse } from '../types';

type Period = 'week' | 'month' | 'quarter';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
];

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
  const [dbData, setDbData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setDbError(null);
    getDashboard()
      .then((data) => {
        setDbData(data);
        setLoading(false);
      })
      .catch((err) => {
        setDbError(err?.response?.data?.detail || err?.message || 'Database unavailable');
        setLoading(false);
      });
  }, []);

  const cases = useMemo(() => {
    if (!dbData || !dbData.recent_documents) return [];
    return dbData.recent_documents.map((d) => ({
      id: `DOC-${d.id}`,
      numericId: d.id,
      docType: d.original_filename,
      district: '—',
      village: d.village || '—',
      surveyNo: d.khasra_number || '—',
      uploadedAt: d.created_at ? new Date(d.created_at).toLocaleDateString() : '—',
      status: d.status === 'VERIFIED' ? 'Approved' : d.status === 'UPLOADED' ? 'Pending' : 'Needs Review',
      risk: (d.risk_level || 'Low') as 'Low' | 'Medium' | 'High',
    }));
  }, [dbData]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cases
      .filter((c) => (status === 'All' ? true : c.status === status))
      .filter(
        (c) =>
          !q ||
          c.id.toLowerCase().includes(q) ||
          c.docType.toLowerCase().includes(q) ||
          c.village.toLowerCase().includes(q) ||
          c.surveyNo.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [cases, search, status]);

  const chartData = useMemo(() => {
    if (!dbData?.stats) {
      return STAGE_LABELS.map((label) => ({ label, value: 0 }));
    }
    return [
      { label: 'Uploaded', value: dbData.stats.total_documents },
      { label: 'Analysed', value: dbData.stats.processed },
      { label: 'Awaiting review', value: dbData.stats.needs_review },
      { label: 'Approved', value: dbData.stats.verified },
    ];
  }, [dbData]);

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

      {dbError && (
        <div className="mb-5 flex items-center gap-3 rounded-card border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <AlertTriangle size={18} className="shrink-0 text-amber-400" />
          <div>
            <p className="font-medium text-amber-300">PostgreSQL Database Offline</p>
            <p className="text-xs text-amber-400/80">{dbError} — Live metrics and persistence require PostgreSQL 16 on port 5432.</p>
          </div>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          accent
          icon={loading ? <Loader2 size={16} className="animate-spin" /> : <FileStack size={16} strokeWidth={1.9} />}
          label="Processed Records"
          value={loading ? 'Loading...' : dbData ? dbData.stats.processed.toLocaleString('en-IN') : 'Unavailable'}
          description="Documents digitized and analysed in this period."
          action={{ label: 'View analysis', onClick: () => navigate('/analysis') }}
        />
        <StatCard
          icon={loading ? <Loader2 size={16} className="animate-spin" /> : <ClipboardCheck size={16} strokeWidth={1.9} />}
          label="Pending Verification"
          value={loading ? 'Loading...' : dbData ? dbData.stats.needs_review.toLocaleString('en-IN') : 'Unavailable'}
          description="Cases awaiting an officer decision."
          action={{ label: 'Open case queue', onClick: () => navigate('/verification') }}
        />
        <StatCard
          icon={loading ? <Loader2 size={16} className="animate-spin" /> : <FileCheck2 size={16} strokeWidth={1.9} />}
          label="Verified Land Records"
          value={loading ? 'Loading...' : dbData ? dbData.stats.verified.toLocaleString('en-IN') : 'Unavailable'}
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
          subtitle={dbData ? `Document stages · ${PERIODS.find((p) => p.value === period)?.label}` : 'Database unavailable'}
          className="xl:col-span-5"
        >
          {loading ? (
            <div className="flex h-44 items-center justify-center text-sm text-ink-3">
              <Loader2 className="animate-spin text-accent mr-2" size={16} /> Loading metrics...
            </div>
          ) : dbData ? (
            <BarChart
              data={chartData}
              accentIndex={3}
              height={176}
            />
          ) : (
            <div className="flex h-44 flex-col items-center justify-center text-center text-sm text-ink-3">
              <p>Activity chart unavailable</p>
              <p className="text-xs text-ink-4 mt-1">Connect PostgreSQL to display stage analytics</p>
            </div>
          )}
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
            </Select>
          </>
        }
      >
        <Table minWidth={900}>
          <THead>
            <TH>Document / Case</TH>
            <TH>File Name</TH>
            <TH>Village</TH>
            <TH>Survey / Khasra No.</TH>
            <TH>Uploaded Date</TH>
            <TH>Status</TH>
            <TH align="right">Action</TH>
          </THead>
          <TBody>
            {loading ? (
              <EmptyRow colSpan={7} message="Loading documents from database..." />
            ) : dbError ? (
              <EmptyRow colSpan={7} message="Cannot load documents: PostgreSQL is unavailable." />
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={7} message="No documents found in database. Upload a document to begin." />
            ) : (
              rows.map((c) => (
                <TR key={c.id} onClick={() => navigate(`/analysis?docId=${c.numericId}`)}>
                  <TD className="tnum text-ink font-medium">{c.id}</TD>
                  <TD>{c.docType}</TD>
                  <TD>{c.village}</TD>
                  <TD className="tnum">{c.surveyNo}</TD>
                  <TD className="text-ink-3">{c.uploadedAt}</TD>
                  <TD>
                    <StatusBadge status={c.status} />
                  </TD>
                  <TD align="right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/analysis?docId=${c.numericId}`);
                      }}
                    >
                      Inspect
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
