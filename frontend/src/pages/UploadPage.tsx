import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Upload as UploadIcon, AlertCircle, Loader2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import { Field, Input } from '../components/ui/Field';
import { uploadDocument } from '../api/client';

const ACCEPTED = ['PDF', 'PNG', 'JPG', 'TIFF'];

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rawFile, setRawFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [form, setForm] = useState({
    docType: 'Sale Deed',
    district: '',
    taluk: '',
    village: '',
    surveyNumber: '',
  });

  const take = (f: File) => {
    setRawFile(f);
    setUploadError(null);
  };

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

  const analyze = async () => {
    if (!rawFile) {
      setUploadError('Please select or drop a land record file (PDF or image) to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      sessionStorage.setItem('uploadedDocName', rawFile.name);
      sessionStorage.setItem('uploadedDocMeta', JSON.stringify(form));

      // Upload to real backend / PostgreSQL
      const uploadedDoc = await uploadDocument(rawFile);
      sessionStorage.setItem('currentDocId', uploadedDoc.id.toString());

      navigate(`/processing?docId=${uploadedDoc.id}`);
    } catch (err: any) {
      console.error('Document upload failed:', err);
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to connect to backend. Please ensure the FastAPI backend and PostgreSQL database are online.';
      setUploadError(detail);
    } finally {
      setIsUploading(false);
    }
  };

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <>
      <PageHeader
        title="Upload Document"
        subtitle="Add a scanned land record and its location details for analysis."
      />

      {uploadError && (
        <div className="mb-4 flex items-center gap-2.5 rounded-card border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          <AlertCircle size={16} className="shrink-0 text-rose-400" />
          <span>{uploadError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Drop zone */}
        <div className="xl:col-span-7 space-y-4">
          <Panel>
            <div
              onDragEnter={onDrag}
              onDragLeave={onDrag}
              onDragOver={onDrag}
              onDrop={onDrop}
              className={`rounded-card border-2 border-dashed p-8 text-center transition-colors ${
                dragActive
                  ? 'border-accent bg-accent/5'
                  : 'border-line-strong hover:border-accent hover:bg-raised'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.tiff"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) take(e.target.files[0]);
                }}
              />
              <span className="mx-auto grid place-items-center h-12 w-12 rounded-full bg-raised text-ink-2">
                <UploadIcon size={22} strokeWidth={1.8} />
              </span>
              <p className="mt-4 text-[14px] font-medium text-ink">
                Drag and drop your scanned document here
              </p>
              <p className="mt-1 text-[12.5px] text-ink-3">
                Supports {ACCEPTED.join(', ')} up to 25 MB
              </p>

              <div className="mt-5 flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
              </div>
            </div>

            {/* Selected file preview */}
            {rawFile ? (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-ctl border border-line bg-raised p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid place-items-center h-9 w-9 shrink-0 rounded-ctl bg-panel text-accent">
                    <FileText size={18} strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink">{rawFile.name}</p>
                    <p className="text-[11.5px] text-ink-3">
                      {(rawFile.size / (1024 * 1024)).toFixed(2)} MB · {rawFile.type || 'Document'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRawFile(null);
                    setUploadError(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="mt-4 rounded-ctl border border-dashed border-line p-3 text-center text-xs text-ink-4">
                No file selected yet. Select a real document to upload and process.
              </div>
            )}
          </Panel>

          <Panel
            title="Scan Guidelines"
            subtitle="Follow these specifications for reliable ML layout detection and OCR."
          >
            <ul className="space-y-2 text-[12.5px] text-ink-2">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                Scan at 300 DPI or higher in full grayscale or colour.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                Ensure all page boundaries, stamps and signatures are completely within the frame.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                Avoid glare or uneven shadowing across tabular schedule regions.
              </li>
            </ul>
          </Panel>
        </div>

        {/* Location & metadata form */}
        <div className="xl:col-span-5 space-y-4">
          <Panel
            title="Document Details"
            subtitle="Optional metadata to cross-reference with official land records."
          >
            <div className="space-y-3.5">
              <Field label="Document Type">
                <Input value={form.docType} onChange={set('docType')} placeholder="e.g. Sale Deed, RoR, RTC" />
              </Field>

              <Field label="District">
                <Input value={form.district} onChange={set('district')} placeholder="Enter district name" />
              </Field>

              <Field label="Taluk / Tehsil">
                <Input value={form.taluk} onChange={set('taluk')} placeholder="Enter taluk or tehsil" />
              </Field>

              <Field label="Village">
                <Input value={form.village} onChange={set('village')} placeholder="Enter village name" />
              </Field>

              <Field label="Survey / Khasra Number">
                <Input value={form.surveyNumber} onChange={set('surveyNumber')} placeholder="Enter survey or khasra number" />
              </Field>
            </div>

            <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
              <span className="text-[12px] text-ink-3">
                {rawFile ? 'File ready for upload' : 'Select a file to continue'}
              </span>
              <Button
                variant="primary"
                size="md"
                disabled={!rawFile || isUploading}
                onClick={analyze}
                iconRight={
                  isUploading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <ArrowRight size={15} strokeWidth={2} />
                  )
                }
              >
                {isUploading ? 'Uploading to Database...' : 'Upload & Start ML Pipeline'}
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
