import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, FileText, X } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Badge, { StatusBadge } from '../components/ui/Badge';
import SegmentedControl from '../components/ui/SegmentedControl';
import { KeyValue, KeyValueList } from '../components/ui/KeyValue';
import { getRecordById } from '../data/mockRecords';

type Tab = 'overview' | 'documents' | 'ownership' | 'verification';

const TABS: { value: Tab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'documents', label: 'Documents' },
  { value: 'ownership', label: 'Ownership History' },
  { value: 'verification', label: 'Verification History' },
];

export default function LandRecordDetailPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  const record = getRecordById(recordId || '');

  if (!record) {
    return (
      <Panel>
        <div className="py-12 text-center">
          <h2 className="text-[16px] font-semibold text-ink">Record not found</h2>
          <p className="mt-1.5 text-[13px] text-ink-3">No land record matches “{recordId}”.</p>
          <Button variant="primary" className="mt-5" onClick={() => navigate('/land-records')}>
            Back to Land Records
          </Button>
        </div>
      </Panel>
    );
  }

  return (
    <>
      <PageHeader
        title={record.recordId}
        subtitle={`${record.recordType} · Survey ${record.surveyNo} · ${record.village}, ${record.taluk}, ${record.district}`}
        actions={
          <>
            <StatusBadge status={record.status} />
            <Button variant="secondary" size="sm" onClick={() => navigate('/land-records')}>
              Back to Records
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-8">
          <Panel
            title="Record Details"
            actions={<SegmentedControl<Tab> options={TABS} value={tab} onChange={setTab} />}
          >
            {tab === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <KeyValueList>
                  <KeyValue label="Owner">{record.ownerName}</KeyValue>
                  <KeyValue label="Father / Husband">{record.fatherOrHusbandName}</KeyValue>
                  <KeyValue label="Survey number">
                    <span className="tnum">{record.surveyNo}</span>
                  </KeyValue>
                  <KeyValue label="Land area">{record.landArea}</KeyValue>
                  <KeyValue label="Record type">{record.recordType}</KeyValue>
                </KeyValueList>
                <KeyValueList>
                  <KeyValue label="Village">{record.village}</KeyValue>
                  <KeyValue label="Taluk">{record.taluk}</KeyValue>
                  <KeyValue label="District">{record.district}</KeyValue>
                  <KeyValue label="Soil classification">{record.soilClassification}</KeyValue>
                  <KeyValue label="Annual assessment">{record.annualTax}</KeyValue>
                </KeyValueList>
              </div>
            )}

            {tab === 'documents' && (
              <ul className="space-y-2.5">
                {record.documents.map((d) => (
                  <li
                    key={d.title}
                    className="flex items-center justify-between gap-4 rounded-ctl border border-line bg-raised px-4 py-3.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-ctl bg-panel text-ink-2">
                        <FileText size={15} strokeWidth={1.9} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] text-ink">{d.title}</p>
                        <p className="text-[11.5px] text-ink-3">
                          {d.type} · {d.date}
                        </p>
                      </div>
                    </div>
                    <Badge tone={d.verified ? 'ok' : 'warn'}>
                      <span className="flex items-center gap-1">
                        {d.verified ? <Check size={11} strokeWidth={2.4} /> : <X size={11} strokeWidth={2.4} />}
                        {d.verified ? 'Verified' : 'Pending'}
                      </span>
                    </Badge>
                  </li>
                ))}
              </ul>
            )}

            {tab === 'ownership' && (
              <ol className="space-y-0">
                {record.ownershipHistory.map((e, i) => (
                  <li key={e.documentRef} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="tnum grid h-9 w-12 shrink-0 place-items-center rounded-ctl bg-raised text-[12px] font-medium text-ink-2">
                        {e.year}
                      </span>
                      {i < record.ownershipHistory.length - 1 && (
                        <span className="my-1 w-px flex-1 bg-line" />
                      )}
                    </div>
                    <div className="pb-6 min-w-0">
                      <p className="text-[13px] font-medium text-ink">{e.type}</p>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">
                        {e.description}
                      </p>
                      <p className="mt-1.5 text-[11.5px] text-ink-3">
                        {e.parties} · {e.documentRef}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {tab === 'verification' && (
              <ul className="space-y-2.5">
                {record.verificationHistory.map((v) => (
                  <li key={v.date} className="rounded-ctl border border-line bg-raised px-4 py-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[13px] font-medium text-ink">{v.outcome}</p>
                      <p className="text-[11.5px] text-ink-3">{v.date}</p>
                    </div>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">{v.remarks}</p>
                    <p className="mt-1.5 text-[11.5px] text-ink-3">{v.officer}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="xl:col-span-4 space-y-5">
          <Panel title="Record Summary">
            <KeyValueList>
              <KeyValue label="Status">
                <StatusBadge status={record.status} />
              </KeyValue>
              <KeyValue label="Last updated">{record.lastUpdated}</KeyValue>
              <KeyValue label="Documents on file">
                <span className="tnum">{record.documents.length}</span>
              </KeyValue>
              <KeyValue label="Ownership events">
                <span className="tnum">{record.ownershipHistory.length}</span>
              </KeyValue>
              <KeyValue label="GPS centroid">
                <span className="tnum">{record.gpsCentroid}</span>
              </KeyValue>
            </KeyValueList>
          </Panel>

          <Panel title="Parcel Location" subtitle="Indicative position from the cadastral survey.">
            <div className="relative h-[190px] overflow-hidden rounded-ctl border border-line bg-raised">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }}
              />
              <div className="absolute left-1/2 top-1/2 h-14 w-20 -translate-x-1/2 -translate-y-1/2 rounded-[4px] border-2 border-accent bg-accent/15" />
              <p className="tnum absolute inset-x-0 bottom-3 text-center text-[11.5px] text-ink-3">
                {record.gpsCentroid}
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
