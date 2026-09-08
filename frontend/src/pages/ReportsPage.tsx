import { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import StatCard from '../components/ui/StatCard';
import BarChart from '../components/ui/BarChart';
import SegmentedControl from '../components/ui/SegmentedControl';
import { FileCheck2, FileStack, Flag } from 'lucide-react';
import { TBody, TD, TH, THead, TR, Table } from '../components/ui/Table';

const DISTRICTS = [
  { district: 'Bengaluru Urban', digitized: 742, verified: 690, pending: 5, flagged: 9 },
  { district: 'Mysuru', digitized: 516, verified: 470, pending: 4, flagged: 7 },
  { district: 'Tumakuru', digitized: 448, verified: 402, pending: 3, flagged: 5 },
  { district: 'Belagavi', digitized: 395, verified: 348, pending: 2, flagged: 6 },
  { district: 'Mandya', digitized: 372, verified: 341, pending: 2, flagged: 4 },
  { district: 'Dakshina Kannada', digitized: 287, verified: 229, pending: 2, flagged: 3 },
];

const MONTHLY = [
  { label: 'Apr', value: 388 },
  { label: 'May', value: 412 },
  { label: 'Jun', value: 436 },
  { label: 'Jul', value: 458 },
  { label: 'Aug', value: 481 },
  { label: 'Sep', value: 142 },
];

/* Quarters run from the pilot quarter to the current one and sum to the same
   2,760 total as the district table. */
const QUARTERLY = [
  { label: 'Q4 2025', value: 96 },
  { label: 'Q1 2026', value: 347 },
  { label: 'Q2 2026', value: 1236 },
  { label: 'Q3 2026', value: 1081 },
];

const TOTALS = DISTRICTS.reduce(
  (a, d) => ({
    digitized: a.digitized + d.digitized,
    verified: a.verified + d.verified,
    pending: a.pending + d.pending,
    flagged: a.flagged + d.flagged,
  }),
  { digitized: 0, verified: 0, pending: 0, flagged: 0 }
);

export default function ReportsPage() {
  const [range, setRange] = useState<'monthly' | 'quarterly'>('monthly');
  const data = range === 'monthly' ? MONTHLY : QUARTERLY;

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Digitization and verification totals across districts."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          icon={<FileStack size={16} strokeWidth={1.9} />}
          label="Records Digitized"
          value={TOTALS.digitized.toLocaleString('en-IN')}
          description="Total documents ingested since the programme began."
        />
        <StatCard
          icon={<FileCheck2 size={16} strokeWidth={1.9} />}
          label="Verified Land Records"
          value={TOTALS.verified.toLocaleString('en-IN')}
          description="Officer-approved and written to the register."
        />
        <StatCard
          icon={<Flag size={16} strokeWidth={1.9} />}
          label="Flagged for Dispute"
          value={TOTALS.flagged.toLocaleString('en-IN')}
          description="Referred for boundary survey or adjudication."
        />
      </div>

      <Panel
        className="mt-5"
        title="Records Digitized"
        subtitle={range === 'monthly' ? 'Last six months' : 'Since the programme began'}
        actions={
          <SegmentedControl
            value={range}
            onChange={setRange}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
            ]}
          />
        }
      >
        <BarChart data={data} height={200} />
      </Panel>

      <Panel flush className="mt-5" title="District Summary">
        <Table minWidth={760}>
          <THead>
            <TH>District</TH>
            <TH align="right">Digitized</TH>
            <TH align="right">Verified</TH>
            <TH align="right">Pending</TH>
            <TH align="right">Flagged</TH>
            <TH align="right">Verified %</TH>
          </THead>
          <TBody>
            {DISTRICTS.map((d) => (
              <TR key={d.district}>
                <TD className="text-ink">{d.district}</TD>
                <TD align="right" className="tnum">
                  {d.digitized.toLocaleString('en-IN')}
                </TD>
                <TD align="right" className="tnum">
                  {d.verified.toLocaleString('en-IN')}
                </TD>
                <TD align="right" className="tnum">
                  {d.pending}
                </TD>
                <TD align="right" className="tnum">
                  {d.flagged}
                </TD>
                <TD align="right" className="tnum text-ink">
                  {Math.round((d.verified / d.digitized) * 100)}%
                </TD>
              </TR>
            ))}
            <TR className="bg-white/[0.015]">
              <TD className="text-ink font-medium">All districts</TD>
              <TD align="right" className="tnum text-ink font-medium">
                {TOTALS.digitized.toLocaleString('en-IN')}
              </TD>
              <TD align="right" className="tnum text-ink font-medium">
                {TOTALS.verified.toLocaleString('en-IN')}
              </TD>
              <TD align="right" className="tnum text-ink font-medium">
                {TOTALS.pending}
              </TD>
              <TD align="right" className="tnum text-ink font-medium">
                {TOTALS.flagged}
              </TD>
              <TD align="right" className="tnum text-ink font-medium">
                {Math.round((TOTALS.verified / TOTALS.digitized) * 100)}%
              </TD>
            </TR>
          </TBody>
        </Table>
      </Panel>
    </>
  );
}
