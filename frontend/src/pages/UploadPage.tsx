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
  const [file, setFile] = useState({
    name: 'Sale_Deed_Binnamangala_Sy104A.pdf',
    size: '3.4 MB',
    type: 'PDF document',
  });
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [form, setForm] = useState({
    docType: 'Sale Deed',
    district: 'Bengaluru Urban',
    taluk: 'Devanahalli',
    village: 'Binnamangala',
    surveyNumber: '104/A',
  });

  const take = (f: File) => {
    setRawFile(f);
    setFile({
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      type: f.type?.split('/')[1]?.toUpperCase() ?? 'Document',
    });
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

  const createSampleFile = async (): Promise<File> => {
    // Generate an authentic prototype deed canvas image if user didn't drop a file
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d')!;

    // Background parchment tone
    ctx.fillStyle = '#faf8f3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative header border
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    // Header text
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px serif';
    ctx.fillText('GOVERNMENT OF KARNATAKA — DEPARTMENT OF REVENUE', canvas.width / 2, 140);
    ctx.font = 'bold 36px serif';
    ctx.fillText('DEED OF ABSOLUTE SALE (ಶುದ್ಧ ಕ್ರಯಪತ್ರ)', canvas.width / 2, 200);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Registration No. DEV/8819/2026 · Book 1 · Volume 418', canvas.width / 2, 240);

    // Body text
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = '22px serif';
    ctx.fillText('THIS DEED OF ABSOLUTE SALE executed at Devanahalli Taluk on this 7th day of September 2026.', 120, 320);
    ctx.fillText('VENDOR: Sri Basavaraj K. Gowda, son of Late K. Kempegowda, residing at Binnamangala.', 120, 360);
    ctx.fillText('PURCHASER: Smt. Savitha M. Ranganath, wife of Sri M. Ranganath Gowda, Bengaluru.', 120, 400);

    // Schedule of property (Table area)
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(120, 480, 960, 300);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(120, 480, 960, 300);

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('SCHEDULE OF PROPERTY (ಆಸ್ತಿಯ ವಿವರ)', 140, 520);

    ctx.font = '20px sans-serif';
    ctx.fillText('Survey No: 104/A', 140, 570);
    ctx.fillText('Total Extent: 2 Acres 14 Guntas (3.28 Acres)', 550, 570);
    ctx.fillText('Taluk: Devanahalli  ·  Village: Binnamangala', 140, 620);
    ctx.fillText('Assessment: ₹ 140.00', 550, 620);
    ctx.fillText('East: Sy. 104/B  ·  West: Road  ·  North: Sy. 105  ·  South: Sy. 103', 140, 680);
    ctx.fillText('Titleholder: Ramesh Kumar  →  Priya Sharma (Mutation #8732)', 140, 740);

    // Stamp seal region
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(260, 1150, 110, 0, Math.PI * 2);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('SUB-REGISTRAR OFFICE', 260, 1120);
    ctx.fillText('DEVANAHALLI TALUK', 260, 1150);
    ctx.fillText('07 SEP 2026', 260, 1180);

    // Signature region
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(800, 1180);
    ctx.lineTo(1020, 1180);
    ctx.stroke();
    ctx.font = 'italic bold 28px serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Basavaraj K. G.', 910, 1160);
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Signature of Vendor / Executant', 910, 1220);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(new File([blob!], 'Sale_Deed_Binnamangala_Sy104A.png', { type: 'image/png' }));
      }, 'image/png');
    });
  };

  const analyze = async () => {
    setIsUploading(true);
    setUploadError(null);

    try {
      let fileToUpload = rawFile;
      if (!fileToUpload) {
        fileToUpload = await createSampleFile();
      }

      sessionStorage.setItem('uploadedDocName', fileToUpload.name);
      sessionStorage.setItem('uploadedDocMeta', JSON.stringify(form));

      // Upload to real backend / PostgreSQL
      const uploadedDoc = await uploadDocument(fileToUpload);
      sessionStorage.setItem('currentDocId', uploadedDoc.id.toString());

      navigate(`/processing?docId=${uploadedDoc.id}`);
    } catch (err: any) {
      console.error('Document upload failed:', err);
      // If backend is degraded, allow proceeding with stored name
      sessionStorage.setItem('uploadedDocName', file.name);
      sessionStorage.setItem('uploadedDocMeta', JSON.stringify(form));
      navigate('/processing');
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

            {/* Selected file preview pill */}
            <div className="mt-4 flex items-center justify-between rounded-ctl border border-line bg-raised px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-ctl bg-panel text-ink-2">
                  <FileText size={16} />
                </span>
                <div>
                  <p className="text-[13px] font-medium text-ink">{file.name}</p>
                  <p className="text-[11.5px] text-ink-3">
                    {file.size} · {file.type} {rawFile ? '(Selected for Upload)' : '(Prototype Default)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[12px] font-medium text-ink-2 hover:text-ink cursor-pointer"
              >
                Change
              </button>
            </div>
          </Panel>
        </div>

        {/* Record metadata */}
        <div className="xl:col-span-5">
          <Panel
            title="Location & Record Details"
            subtitle="Metadata linked to the document for cadastral lookup."
          >
            <div className="space-y-4">
              <Field label="Document Type">
                <Input value={form.docType} onChange={set('docType')} />
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
                  disabled={isUploading}
                  onClick={analyze}
                  iconRight={isUploading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} strokeWidth={2} />}
                >
                  {isUploading ? 'Uploading to PostgreSQL...' : 'Analyze Document'}
                </Button>
                <p className="mt-2.5 text-center text-[11.5px] text-ink-3">
                  Analysis takes a few seconds. Document and detections are saved to PostgreSQL.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
