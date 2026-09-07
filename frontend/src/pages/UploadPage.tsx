import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('Sale Deed');
  const [district, setDistrict] = useState('Bengaluru Urban');
  const [taluk, setTaluk] = useState('Devanahalli');
  const [surveyNo, setSurveyNo] = useState('104/A');
  const [success, setSuccess] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleProcess = () => {
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/analysis');
      }, 700);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Digitization Pipeline
          </span>
          <span className="text-xs text-slate-500 font-mono">STEP 01 OF 03</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Upload Land Document</h1>
        <p className="text-sm text-slate-400 mt-1">
          Ingest scanned physical land records for AI-assisted structural analysis and verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Drag & Drop Zone */}
        <div className="lg:col-span-2 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`rounded-2xl p-10 text-center border-2 border-dashed transition-all duration-200 cursor-pointer ${
              dragOver
                ? 'border-emerald-400 bg-emerald-950/30'
                : file
                ? 'border-emerald-500/40 bg-[#11161d]'
                : 'border-white/15 bg-[#11161d] hover:border-white/30'
            }`}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-3xl">
              {file ? '📄' : '📤'}
            </div>

            <h3 className="text-base font-semibold text-white mb-1">
              {file ? file.name : 'Drag & drop scanned document here'}
            </h3>
            <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
              Supports JPEG, PNG, TIFF, or PDF format. High-resolution scans (300+ DPI recommended).
            </p>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-100 text-xs font-semibold cursor-pointer border border-white/10 transition-all">
              <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>{file ? 'Choose Different File' : 'Browse Files'}</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.tiff,.tif,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>

            {file && (
              <div className="mt-4 inline-flex items-center gap-3 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono">
                <span>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
                <span>·</span>
                <span>Type: {file.type || 'Document'}</span>
              </div>
            )}
          </div>

          {/* Supported Format Specifications */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Automated OCR Pre-Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Perspective Deskew &amp; Denoising</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>SHA-256 Hashing at Ingestion</span>
            </div>
          </div>
        </div>

        {/* Right (1 col): Metadata Form */}
        <div className="p-6 rounded-2xl bg-[#11161d] border border-white/[0.08] flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white tracking-tight border-b border-white/[0.06] pb-3">
              Record Metadata
            </h3>

            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1.5">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="Sale Deed" className="bg-[#11161d]">Sale Deed</option>
                <option value="RTC Record" className="bg-[#11161d]">RTC Record (Pahani)</option>
                <option value="Mutation Extract" className="bg-[#11161d]">Mutation Extract</option>
                <option value="Khata Certificate" className="bg-[#11161d]">Khata Certificate</option>
                <option value="Survey Sketch" className="bg-[#11161d]">Survey Sketch (Tippani)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5">Taluk</label>
                <input
                  type="text"
                  value={taluk}
                  onChange={(e) => setTaluk(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1.5">Survey Number</label>
              <input
                type="text"
                value={surveyNo}
                onChange={(e) => setSurveyNo(e.target.value)}
                placeholder="e.g. 104/A"
                className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            {success ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs text-center font-semibold animate-pulse">
                ✓ Upload Complete! Redirecting to Analysis...
              </div>
            ) : (
              <button
                type="button"
                disabled={!file || uploading}
                onClick={handleProcess}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#07130b] font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Document...</span>
                  </>
                ) : (
                  <>
                    <span>Process Document</span>
                    <span>→</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
