import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Upload as UploadIcon } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import { Field, Input, Select } from '../components/ui/Field';

const ACCEPTED = ['PDF', 'PNG', 'JPG', 'TIFF'];

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState({
    name: 'Sale_Deed_Binnamangala_Sy104A.pdf',
    size: '3.4 MB',
    type: 'PDF document',
  });
  const [dragActive, setDragActive] = useState(false);
  const [form, setForm] = useState({
    docType: 'Sale Deed',
    district: 'Bengaluru Urban',
    taluk: 'Devanahalli',
    village: 'Binnamangala',
    surveyNumber: '104/A',
  });

  const take = (f: File) =>
    setFile({
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      type: f.type?.split('/')[1]?.toUpperCase() ?? 'Document',
    });

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) take(e.dataTransfer.files[0]);
  };

  const analyze = () => {
    sessionStorage.setItem('uploadedDocName', file.name);
    sessionStorage.setItem('uploadedDocMeta', JSON.stringify(form));
    navigate('/processing');
  };

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <>
      <PageHeader
        title="Upload Document"
        subtitle="Add a scanned land record and its location details for analysis."
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Drop zone */}
        <div className="xl:col-span-7 space-y-4">
          <Panel>
            <div
              onDragEnter={onDrag}
              onDragLeave={onDrag}
              onDragOver={onDrag}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-ctl border border-dashed px-8 text-center transition-colors ${
                dragActive
                  ? 'border-accent/60 bg-accent/[0.06]'
                  : 'border-line-strong bg-raised/50 hover:bg-raised'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.tiff"
                onChange={(e) => e.target.files?.[0] && take(e.target.files[0])}
                className="hidden"
              />
              <span className="grid h-11 w-11 place-items-center rounded-ctl bg-panel border border-line text-ink-2">
                <UploadIcon size={18} strokeWidth={1.9} />
              </span>
              <p className="mt-4 text-[14.5px] font-medium text-ink">
                Drag and drop the document here
              </p>
              <p className="mt-1.5 text-[12.5px] text-ink-3">
                or <span className="text-accent-hi font-medium">browse files</span> from your
                computer
              </p>
              <p className="mt-5 text-[11.5px] text-ink-3">
                Accepted formats: {ACCEPTED.join(' · ')} — up to 25 MB
              </p>
            </div>
          </Panel>

          <div className="flex items-center justify-between gap-4 rounded-card border border-line bg-panel px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-ctl bg-raised text-ink-2">
                <FileText size={16} strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-ink">{file.name}</p>
                <p className="text-[11.5px] text-ink-3">
                  {file.size} · {file.type}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
              Change
            </Button>
          </div>
        </div>

        {/* Metadata */}
        <div className="xl:col-span-5">
          <Panel title="Record Details" subtitle="Used to match the document to a land record.">
            <div className="space-y-4">
              <Field label="Document Type">
                <Select value={form.docType} onChange={set('docType')}>
                  <option>Sale Deed</option>
                  <option>Mutation Record</option>
                  <option>RTC Record (Pahani)</option>
                  <option>Partition Deed</option>
                  <option>Grant Certificate</option>
                </Select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="District">
                  <Input value={form.district} onChange={set('district')} />
                </Field>
                <Field label="Taluk">
                  <Input value={form.taluk} onChange={set('taluk')} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Village">
                  <Input value={form.village} onChange={set('village')} />
                </Field>
                <Field label="Survey Number">
                  <Input className="tnum" value={form.surveyNumber} onChange={set('surveyNumber')} />
                </Field>
              </div>

              <div className="border-t border-line pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  block
                  onClick={analyze}
                  iconRight={<ArrowRight size={15} strokeWidth={2} />}
                >
                  Analyze Document
                </Button>
                <p className="mt-2.5 text-center text-[11.5px] text-ink-3">
                  Analysis takes a few seconds. You can review the results before deciding.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
