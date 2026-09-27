import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, AlertCircle, Upload, RefreshCw } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import SegmentedControl from '../components/ui/SegmentedControl';
import { StatusBadge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/Field';
import { EmptyRow, TBody, TD, TH, THead, TR, Table } from '../components/ui/Table';
import { getDocuments } from '../api/client';
import type { DocumentOut } from '../types';

type Filter = 'All' | 'Needs Review' | 'Investigation' | 'Verified' | 'Rejected';

export default function VerificationCasesPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentOut[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');

  const loadDocuments = () => {
    setLoading(true);
    setError(null);
    getDocuments()
      .then((data) => {
        setDocuments(data.documents || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.response?.data?.detail || err.message || 'Failed to connect to PostgreSQL database');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const counts = useMemo(
    () => ({
      All: documents.length,
      'Needs Review': documents.filter(
        (d) =>
          d.status === 'REVIEW_REQUIRED' ||
          d.status === 'VALIDATED' ||
          d.status === 'FIELDS_PARSED' ||
          d.status === 'READY_FOR_APPROVAL'
      ).length,
      Investigation: documents.filter((d) => d.status === 'INVESTIGATION_REQUIRED').length,
      Verified: documents.filter((d) => d.status === 'VERIFIED' || d.status === 'APPROVED').length,
      Rejected: documents.filter((d) => d.status === 'REJECTED').length,
    }),
    [documents]
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents
      .filter((d) => {
        if (filter === 'All') return true;
        if (filter === 'Needs Review') {
          return (
            d.status === 'REVIEW_REQUIRED' ||
            d.status === 'VALIDATED' ||
            d.status === 'FIELDS_PARSED' ||
            d.status === 'READY_FOR_APPROVAL'
          );
        }
        if (filter === 'Investigation') return d.status === 'INVESTIGATION_REQUIRED';
        if (filter === 'Verified') return d.status === 'VERIFIED' || d.status === 'APPROVED';
        if (filter === 'Rejected') return d.status === 'REJECTED';
        return true;
      })
      .filter(
        (d) =>
          !q ||
          d.id.toString().includes(q) ||
          d.original_filename.toLowerCase().includes(q) ||
          (d.village && d.village.toLowerCase().includes(q)) ||
          (d.khasra_number && d.khasra_number.toLowerCase().includes(q))
      );
  }, [documents, filter, search]);

  const mapStatusToTone = (status: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Flagged';
      case 'INVESTIGATION_REQUIRED':
        return 'Needs Review';
      case 'REVIEW_REQUIRED':
      case 'VALIDATED':
      case 'FIELDS_PARSED':
        return 'Pending';
      default:
        return 'Draft';
    }
  };

  return (
    <>
      <PageHeader
        title="Verification Queue"
        subtitle="Real land record documents stored in PostgreSQL awaiting officer review and decision."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={loadDocuments} icon={<RefreshCw size={13} />}>
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Upload size={14} />}
              onClick={() => navigate('/upload')}
            >
              Upload Document
            </Button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-card border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          <AlertCircle size={16} className="shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <Panel
        flush
        actions={
          <>
            <SegmentedControl<Filter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'All', label: 'All', count: counts.All },
                { value: 'Needs Review', label: 'Needs Review', count: counts['Needs Review'] },
                { value: 'Investigation', label: 'Investigation', count: counts.Investigation },
                { value: 'Verified', label: 'Verified', count: counts.Verified },
                { value: 'Rejected', label: 'Rejected', count: counts.Rejected },
              ]}
            />
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search filename, village, khasra"
              className="w-[240px]"
            />
          </>
        }
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-ink-3">
            <Loader2 className="animate-spin text-accent mb-3" size={26} />
            <p className="text-sm">Loading records from PostgreSQL database...</p>
          </div>
        ) : (
          <Table minWidth={900}>
            <THead>
              <TH>Doc ID</TH>
              <TH>Original File</TH>
              <TH>Village</TH>
              <TH>Khasra No.</TH>
              <TH>Risk Assessment</TH>
              <TH>Upload Date</TH>
              <TH>Pipeline Status</TH>
              <TH align="right">Action</TH>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyRow
                  colSpan={8}
                  message="No documents found in verification queue. Upload a new deed or land document to start the real digitization pipeline."
                />
              ) : (
                rows.map((d) => (
                  <TR key={d.id} onClick={() => navigate(`/verification/${d.id}`)} className="cursor-pointer">
                    <TD className="font-mono text-ink-2">#{d.id}</TD>
                    <TD className="font-medium text-ink max-w-[220px] truncate" title={d.original_filename}>
                      {d.original_filename}
                    </TD>
                    <TD className="text-ink-2">{d.village || <span className="text-ink-4 italic">not extracted</span>}</TD>
                    <TD className="font-mono text-ink-2">
                      {d.khasra_number || <span className="text-ink-4 italic">not extracted</span>}
                    </TD>
                    <TD>
                      {d.risk_level ? (
                        <span
                          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-mono font-medium ${
                            d.risk_level === 'HIGH'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : d.risk_level === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {d.risk_level} {d.risk_score !== null ? `(${d.risk_score.toFixed(0)})` : ''}
                        </span>
                      ) : (
                        <span className="text-ink-4 text-xs italic">insufficient data</span>
                      )}
                    </TD>
                    <TD className="text-xs text-ink-3">
                      {d.created_at ? new Date(d.created_at).toLocaleDateString() : 'N/A'}
                    </TD>
                    <TD>
                      <StatusBadge status={mapStatusToTone(d.status)} />
                    </TD>
                    <TD align="right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/verification/${d.id}`);
                        }}
                        iconRight={<ArrowRight size={13} />}
                      >
                        Review
                      </Button>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        )}
      </Panel>
    </>
  );
}
