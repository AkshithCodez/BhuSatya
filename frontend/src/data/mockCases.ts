export interface VerificationCase {
  id: string;
  docType: string;
  district: string;
  taluk: string;
  village: string;
  surveyNo: string;
  ownerName: string;
  extent: string;
  officer: string;
  status: 'Pending' | 'Needs Review' | 'Approved' | 'Flagged';
  updatedAt: string;
  uploadDate: string;
  documentQuality: 'Good' | 'Fair' | 'Requires Clarification';
  findings: {
    summary: string;
    textDetected: string;
    tablesDetected: string;
    signatureDetected: string;
    stampDetected: string;
    inconsistencies: string;
  };
  officerNotes?: string;
  reviewedAt?: string;
}

export const INITIAL_CASES: VerificationCase[] = [
  {
    id: 'BLR-2026-8819',
    docType: 'Sale Deed',
    district: 'Bengaluru Urban',
    taluk: 'Devanahalli',
    village: 'Binnamangala',
    surveyNo: '104/A',
    ownerName: 'Savitha M. Ranganath',
    extent: '2 Acres 14 Guntas',
    officer: 'Officer Rajesh Kumar',
    status: 'Pending',
    updatedAt: 'Today, 10:24 AM',
    uploadDate: '2026-09-08 10:20 AM',
    documentQuality: 'Good',
    findings: {
      summary: 'No major structural inconsistencies detected. Boundaries and schedule match municipal survey register.',
      textDetected: '12 text blocks (Grantor: Basavaraj K. Gowda, Grantee: Savitha M. Ranganath, Consideration: ₹45,00,000)',
      tablesDetected: '2 property schedule grids verified with survey boundary coordinates',
      signatureDetected: '1 executive grantor signature stroke-matched',
      stampDetected: '1 official Sub-Registrar Devanahalli jurisdictional stamp identified',
      inconsistencies: 'None detected across tabular and title boundaries.',
    },
  },
  {
    id: 'MYS-2026-4412',
    docType: 'Mutation Record',
    district: 'Mysuru',
    taluk: 'Hunsur',
    village: 'Biligere',
    surveyNo: '42/3',
    ownerName: 'Ramesh C. Patil',
    extent: '1 Acre 20 Guntas',
    officer: 'Officer Rajesh Kumar',
    status: 'Needs Review',
    updatedAt: 'Yesterday, 4:31 PM',
    uploadDate: '2026-09-07 04:15 PM',
    documentQuality: 'Fair',
    findings: {
      summary: 'Manual review recommended. Marginal boundary variance (0.04 Guntas) between legacy index and digitized entry.',
      textDetected: '8 text blocks extracted with minor ink fade in grantor declaration section',
      tablesDetected: '1 Khasra tabular structure detected; parcel sub-division column requires officer verification',
      signatureDetected: '1 revenue inspector signature verified',
      stampDetected: '1 Taluk Revenue Office stamp verified',
      inconsistencies: 'Area measurement notation in Kannada text differs slightly from schedule table numerals.',
    },
  },
  {
    id: 'TMK-2026-3190',
    docType: 'RTC Record',
    district: 'Tumakuru',
    taluk: 'Tiptur',
    village: 'Kibbanahalli',
    surveyNo: '88/1',
    ownerName: 'Gangadhar N. Swamy',
    extent: '3 Acres 02 Guntas',
    officer: 'Officer Rajesh Kumar',
    status: 'Approved',
    updatedAt: 'Yesterday, 11:15 AM',
    uploadDate: '2026-09-07 10:50 AM',
    documentQuality: 'Good',
    findings: {
      summary: 'Record successfully verified and approved. RTC Form 16 attributes match state Bhoomi database.',
      textDetected: '15 bilingual text blocks verified (Kannada & English)',
      tablesDetected: '2 structured crop & cultivation tabular records',
      signatureDetected: '1 Village Accountant digital token signature',
      stampDetected: '1 Revenue Circle jurisdictional stamp confirmed',
      inconsistencies: 'Zero discrepancies identified. Complete concordance.',
    },
    officerNotes: 'Verified against Bhoomi RTC database record #RTC-2026-TMK. Legally clear.',
    reviewedAt: '2026-09-07 11:15 AM',
  },
  {
    id: 'BLG-2026-1044',
    docType: 'Partition Deed',
    district: 'Belagavi',
    taluk: 'Gokak',
    village: 'Mamdapur',
    surveyNo: '15/B',
    ownerName: 'Suresh & Brothers',
    extent: '4 Acres 10 Guntas',
    officer: 'Officer Rajesh Kumar',
    status: 'Flagged',
    updatedAt: '06 Sep 2026',
    uploadDate: '2026-09-06 02:40 PM',
    documentQuality: 'Requires Clarification',
    findings: {
      summary: 'Flagged for dispute resolution. Multiple conflicting co-owner endorsements detected.',
      textDetected: '18 text blocks extracted across 3 partition schedules',
      tablesDetected: '3 share allocation tables detected with unequal sub-division totals',
      signatureDetected: '3 signatures detected; 1 signature position missing corresponding stamp',
      stampDetected: '1 Sub-Registrar stamp identified',
      inconsistencies: 'Sum of sub-allocated acreage (4.45 Acres) exceeds total registered deed area (4.10 Acres).',
    },
    officerNotes: 'Flagged due to acreage summation discrepancy. Forwarded to Tahsildar for boundary survey verification.',
    reviewedAt: '2026-09-06 04:30 PM',
  },
  {
    id: 'MND-2026-7201',
    docType: 'Sale Deed',
    district: 'Mandya',
    taluk: 'Maddur',
    village: 'Shivapura',
    surveyNo: '210/2',
    ownerName: 'Manjunath K. V.',
    extent: '1 Acre 35 Guntas',
    officer: 'Officer Rajesh Kumar',
    status: 'Approved',
    updatedAt: '05 Sep 2026',
    uploadDate: '2026-09-05 09:15 AM',
    documentQuality: 'Good',
    findings: {
      summary: 'No inconsistencies detected. Clean title progression verified with prior encumbrance certificate.',
      textDetected: '14 text blocks identified and cross-validated with registration index',
      tablesDetected: '1 standard property boundary table',
      signatureDetected: '2 party signatures and 2 witness signatures confirmed',
      stampDetected: '1 Maddur Sub-Registrar fiscal stamp verified',
      inconsistencies: 'None detected.',
    },
    officerNotes: 'Verified against encumbrance certificate 2011-2026. Nil encumbrance confirmed.',
    reviewedAt: '2026-09-05 11:20 AM',
  },
  {
    id: 'DKN-2026-5590',
    docType: 'Grant Certificate',
    district: 'Dakshina Kannada',
    taluk: 'Bantwal',
    village: 'Modankap',
    surveyNo: '77/4',
    ownerName: 'Poornima Devadiga',
    extent: '2 Acres 05 Guntas',
    officer: 'Officer Rajesh Kumar',
    status: 'Pending',
    updatedAt: '04 Sep 2026',
    uploadDate: '2026-09-04 03:30 PM',
    documentQuality: 'Good',
    findings: {
      summary: 'Preliminary analysis complete. Ready for revenue officer supervisory inspection.',
      textDetected: '10 text blocks extracted from Akrama-Sakrama grant certificate',
      tablesDetected: '1 land grant assessment schedule table',
      signatureDetected: '1 Special Tahsildar signature verified',
      stampDetected: '1 Government of Karnataka revenue seal confirmed',
      inconsistencies: 'No structural errors detected.',
    },
  },
];

const STORAGE_KEY = 'bhusatya_cases_v3';

export function getCases(): VerificationCase[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load cases from localStorage, using initial data:', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CASES));
  return INITIAL_CASES;
}

export function getCaseById(caseId: string): VerificationCase | undefined {
  const cases = getCases();
  return cases.find((c) => c.id.toLowerCase() === caseId.toLowerCase());
}

export function updateCaseStatus(
  caseId: string,
  newStatus: VerificationCase['status'],
  notes?: string
): VerificationCase | null {
  const cases = getCases();
  const index = cases.findIndex((c) => c.id.toLowerCase() === caseId.toLowerCase());
  if (index === -1) return null;

  const now = new Date();
  const formattedTime = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const updated: VerificationCase = {
    ...cases[index],
    status: newStatus,
    updatedAt: formattedTime,
    reviewedAt: formattedTime,
    officerNotes: notes || cases[index].officerNotes,
  };

  cases[index] = updated;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  } catch (e) {
    console.error('Failed to save updated cases to localStorage:', e);
  }

  // Also append to audit trail
  try {
    const auditLogsKey = 'bhusatya_audit_logs_v3';
    const existingLogsStr = localStorage.getItem(auditLogsKey);
    const logs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
    logs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: formattedTime,
      officer: updated.officer,
      action: `Case ${newStatus}: ${updated.docType}`,
      caseOrRecord: updated.id,
      status: newStatus,
      notes: notes || `Officer updated case status to ${newStatus}`,
    });
    localStorage.setItem(auditLogsKey, JSON.stringify(logs));
  } catch (e) {
    console.warn('Failed to append to audit logs:', e);
  }

  return updated;
}
