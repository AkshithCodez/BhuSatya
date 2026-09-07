export interface AuditLogEntry {
  id: string;
  timestamp: string;
  officer: string;
  action: string;
  caseOrRecord: string;
  status: string;
  notes?: string;
  ipAddress?: string;
}

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-2026-9041',
    timestamp: 'Today, 10:24 AM',
    officer: 'Officer Rajesh Kumar',
    action: 'Document Ingestion & AI Element Detection Completed',
    caseOrRecord: 'BLR-2026-8819',
    status: 'Pending',
    notes: 'Uploaded Sale Deed #8819 for Devanahalli Taluk. 4 elements detected.',
    ipAddress: '10.14.88.21 (Gov Net)',
  },
  {
    id: 'AUD-2026-9038',
    timestamp: 'Yesterday, 4:31 PM',
    officer: 'Officer Rajesh Kumar',
    action: 'Case Referred for Boundary Inspection',
    caseOrRecord: 'MYS-2026-4412',
    status: 'Needs Review',
    notes: 'Marginal 0.04 Gunta variance flagged between schedule table and text.',
    ipAddress: '10.14.88.21 (Gov Net)',
  },
  {
    id: 'AUD-2026-9035',
    timestamp: 'Yesterday, 11:15 AM',
    officer: 'Officer Rajesh Kumar',
    action: 'Official Digital Sign-off Granted',
    caseOrRecord: 'TMK-2026-3190',
    status: 'Approved',
    notes: 'Approved RTC Form 16 record. Concordance with state Bhoomi database verified.',
    ipAddress: '10.14.88.21 (Gov Net)',
  },
  {
    id: 'AUD-2026-9029',
    timestamp: '06 Sep 2026, 04:30 PM',
    officer: 'Officer Rajesh Kumar',
    action: 'Case Flagged for Disputed Title Summation',
    caseOrRecord: 'BLG-2026-1044',
    status: 'Flagged',
    notes: 'Sub-divided claims sum to 4.45 Acres against registered extent of 4.10 Acres.',
    ipAddress: '10.14.88.21 (Gov Net)',
  },
  {
    id: 'AUD-2026-9022',
    timestamp: '05 Sep 2026, 11:20 AM',
    officer: 'Officer Rajesh Kumar',
    action: 'Sale Deed Verification Approved & RoR Updated',
    caseOrRecord: 'MND-2026-7201',
    status: 'Approved',
    notes: 'Nil encumbrance verified over 15-year search interval.',
    ipAddress: '10.14.88.21 (Gov Net)',
  },
  {
    id: 'AUD-2026-9014',
    timestamp: '04 Sep 2026, 03:30 PM',
    officer: 'Operator Vinod S.',
    action: 'Grant Certificate Scanned & Ingested',
    caseOrRecord: 'DKN-2026-5590',
    status: 'Pending',
    notes: 'Akrama-Sakrama Grant Certificate #77/4 uploaded.',
    ipAddress: '10.14.92.10 (Bantwal Taluk)',
  },
];

const AUDIT_STORAGE_KEY = 'bhusatya_audit_logs_v3';

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const saved = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load audit logs from localStorage:', e);
  }
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
  return INITIAL_AUDIT_LOGS;
}
