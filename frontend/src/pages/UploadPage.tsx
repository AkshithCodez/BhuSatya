import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument } from '../api/client';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const doc = await uploadDocument(file);
      navigate(`/documents/${doc.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Upload Land Document</h1>

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-white'
        }`}
      >
        <div className="text-5xl mb-4">📄</div>
        <p className="text-lg font-medium text-slate-700 mb-2">
          {file ? file.name : 'Drop your document here'}
        </p>
        <p className="text-sm text-slate-500 mb-4">
          Supports: JPEG, PNG, TIFF, PDF (up to 10 pages)
        </p>
        <label className="inline-block px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg cursor-pointer hover:bg-slate-200 transition text-sm font-medium">
          Browse Files
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.tiff,.tif,.pdf,.bmp"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>
      </div>

      {file && (
        <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-700">{file.name}</p>
            <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload & Process'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 text-red-600 text-sm rounded-lg p-3 border border-red-200">
          {error}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 text-sm text-blue-700">
        <p className="font-medium mb-1">How it works</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-600">
          <li>Upload a land document image or PDF</li>
          <li>AI model detects tables, signatures, and stamps</li>
          <li>System extracts and validates information against reference records</li>
          <li>Officer reviews, corrects, and approves the record</li>
        </ol>
      </div>
    </div>
  );
}
