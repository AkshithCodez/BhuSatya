import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import SegmentedControl from '../components/ui/SegmentedControl';
import { StatusBadge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/Field';
import { EmptyRow, TBody, TD, TH, THead, TR, Table } from '../components/ui/Table';
import { getCases, type VerificationCase } from '../data/mockCases';

type Filter = 'All' | VerificationCase['status'];

export default function VerificationCasesPage() {
  const navigate = useNavigate();
  const cases = useMemo(() => getCases(), []);
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');

  const counts = useMemo(
    () => ({
      All: cases.length,
      Pending: cases.filter((c) => c.status === 'Pending').length,
      'Needs Review': cases.filter((c) => c.status === 'Needs Review').length,
      Approved: cases.filter((c) => c.status === 'Approved').length,
      Flagged: cases.filter((c) => c.status === 'Flagged').length,
    }),
    [cases]
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cases
      .filter((c) => (filter === 'All' ? true : c.status === filter))
      .filter(
        (c) =>
          !q ||
          c.id.toLowerCase().includes(q) ||
          c.docType.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q) ||
          c.village.toLowerCase().includes(q) ||
          c.surveyNo.toLowerCase().includes(q) ||
          c.ownerName.toLowerCase().includes(q)
      );
  }, [cases, filter, search]);

  return (
    <>
      <PageHeader
        title="Verification Cases"
        subtitle="Documents awaiting an officer decision, and cases already decided."
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilter('All');
              setSearch('');
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
            <SegmentedControl<Filter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'All', label: 'All', count: counts.All },
                { value: 'Pending', label: 'Pending', count: counts.Pending },
                { value: 'Needs Review', label: 'Review', count: counts['Needs Review'] },
                { value: 'Approved', label: 'Approved', count: counts.Approved },
                { value: 'Flagged', label: 'Flagged', count: counts.Flagged },
              ]}
            />
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cases"
              className="w-[210px]"
            />
          </>
        }
      >
        <Table minWidth={900}>
          <THead>
            <TH>Case</TH>
            <TH>Document Type</TH>
            <TH>District</TH>
            <TH>Village</TH>
            <TH>Survey No.</TH>
            <TH>Updated</TH>
            <TH>Status</TH>
            <TH align="right">Action</TH>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <EmptyRow colSpan={8} message="No cases match the current filters." />
            ) : (
              rows.map((c) => (
                <TR key={c.id} onClick={() => navigate(`/verification/${c.id}`)}>
                  <TD className="tnum whitespace-nowrap text-ink font-medium">{c.id}</TD>
                  <TD className="whitespace-nowrap">{c.docType}</TD>
                  <TD className="whitespace-nowrap">{c.district}</TD>
                  <TD className="whitespace-nowrap">{c.village}</TD>
                  <TD className="tnum whitespace-nowrap">{c.surveyNo}</TD>
                  <TD className="whitespace-nowrap text-ink-3">{c.updatedAt}</TD>
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
