import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
    previewUrl?: string;
  }>({
    name: 'Sale_Deed_Binnamangala_Sy104A.pdf',
    size: '3.4 MB',
    type: 'PDF Document',
  });

  const [formData, setFormData] = useState({
    docType: 'Sale Deed',
    district: 'Bengaluru Urban',
    taluk: 'Devanahalli',
    village: 'Binnamangala',
    surveyNumber: '104/A',
  });

  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type || 'Document',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type || 'Document',
      });
    }
  };

  const handleAnalyze = () => {
    // Pass metadata to processing and analysis
    sessionStorage.setItem('uploadedDocName', selectedFile.name);
    sessionStorage.setItem('uploadedDocMeta', JSON.stringify(formData));
    navigate('/processing');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Upload Land Document</h1>
        <p className="text-sm text-[#94A39B] mt-1">
          Upload scanned records for AI-assisted analysis.
        </p>
      </div>

      {/* Main 2-Column Upload Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Upload Zone (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-10 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[340px] ${
              dragActive
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-white/[0.12] bg-[#161E1B] hover:border-emerald-500/40 hover:bg-[#19221F]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.tiff"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-[#1E2824] border border-white/[0.08] flex items-center justify-center text-emerald-400 mb-4">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <p className="text-base font-semibold text-white">
              Drag and drop land record file here
            </p>
            <p className="text-xs text-[#94A39B] mt-1">
              or <span className="text-emerald-400 font-medium">Browse Files</span> from your computer
            </p>

            <div className="flex items-center gap-2 mt-5">
              <span className="text-[11px] px-2.5 py-1 rounded-md bg-white/[0.04] text-[#94A39B] border border-white/[0.06]">
                PDF
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-md bg-white/[0.04] text-[#94A39B] border border-white/[0.06]">
                PNG
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-md bg-white/[0.04] text-[#94A39B] border border-white/[0.06]">
                JPG
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-md bg-white/[0.04] text-[#94A39B] border border-white/[0.06]">
                TIFF
              </span>
            </div>
          </div>

          {/* Selected File Card */}
          {selectedFile && (
            <div className="p-4 rounded-2xl bg-[#161E1B] border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{selectedFile.name}</p>
                  <p className="text-xs text-[#94A39B]">
                    {selectedFile.size} · {selectedFile.type} · Ready for processing
                  </p>
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: Metadata Panel (5 cols) */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-2xl bg-[#161E1B] border border-white/[0.08] space-y-5">
            <h2 className="text-base font-semibold text-white pb-3 border-b border-white/[0.08]">
              Record Metadata
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#94A39B] mb-1.5">
                  Document Type
                </label>
                <select
                  value={formData.docType}
                  onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#0F1513] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500/40"
                >
                  <option value="Sale Deed">Sale Deed</option>
                  <option value="Mutation Record">Mutation Record</option>
                  <option value="RTC Record (Pahani)">RTC Record (Pahani)</option>
                  <option value="Partition Deed">Partition Deed</option>
                  <option value="Grant Certificate">Grant Certificate</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#94A39B] mb-1.5">
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#0F1513] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A39B] mb-1.5">
                    Taluk
                  </label>
                  <input
                    type="text"
                    value={formData.taluk}
                    onChange={(e) => setFormData({ ...formData, taluk: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#0F1513] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#94A39B] mb-1.5">
                    Village
                  </label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#0F1513] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A39B] mb-1.5">
                    Survey Number
                  </label>
                  <input
                    type="text"
                    value={formData.surveyNumber}
                    onChange={(e) => setFormData({ ...formData, surveyNumber: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#0F1513] border border-white/[0.08] text-sm text-white font-mono focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={handleAnalyze}
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Analyze Document</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
