export const getRiskColor = (level: string | null) => {
  switch (level?.toUpperCase()) {
    case 'CRITICAL': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
    case 'HIGH': return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' };
    case 'MODERATE': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' };
    case 'LOW': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
    default: return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' };
  }
};

export const getStatusColor = (status: string) => {
  if (['VERIFIED'].includes(status)) return 'bg-green-100 text-green-700';
  if (['REJECTED', 'INVESTIGATION_REQUIRED'].includes(status)) return 'bg-red-100 text-red-700';
  if (['REVIEW_REQUIRED', 'READY_FOR_APPROVAL'].includes(status)) return 'bg-amber-100 text-amber-700';
  if (['DETECTING_LAYOUT', 'VALIDATING'].includes(status)) return 'bg-blue-100 text-blue-700';
  return 'bg-slate-100 text-slate-600';
};

export const getDetectionColor = (className: string) => {
  switch (className) {
    case 'table': return { stroke: '#2563eb', fill: 'rgba(37,99,235,0.12)', label: 'bg-blue-600' };
    case 'signature': return { stroke: '#7c3aed', fill: 'rgba(124,58,237,0.12)', label: 'bg-violet-600' };
    case 'stamp': return { stroke: '#059669', fill: 'rgba(5,150,105,0.12)', label: 'bg-emerald-600' };
    default: return { stroke: '#6b7280', fill: 'rgba(107,114,128,0.12)', label: 'bg-gray-600' };
  }
};

export const formatDate = (date: string | null) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};
