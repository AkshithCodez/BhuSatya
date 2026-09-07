export interface OwnershipEvent {
  year: string;
  type: string;
  description: string;
  parties: string;
  documentRef: string;
}

export interface LandRecord {
  recordId: string;
  surveyNo: string;
  ownerName: string;
  fatherOrHusbandName: string;
  village: string;
  taluk: string;
  district: string;
  landArea: string;
  recordType: string;
  status: 'Verified' | 'Under Review' | 'Flagged';
  lastUpdated: string;
  soilClassification: string;
  annualTax: string;
  gpsCentroid: string;
  documents: {
    title: string;
    type: string;
    date: string;
    verified: boolean;
  }[];
  ownershipHistory: OwnershipEvent[];
  verificationHistory: {
    date: string;
    officer: string;
    outcome: string;
    remarks: string;
  }[];
}

export const INITIAL_RECORDS: LandRecord[] = [
  {
    recordId: 'REC-KA-BLR-104A',
    surveyNo: '104/A',
    ownerName: 'Savitha M. Ranganath',
    fatherOrHusbandName: 'M. Ranganath Gowda',
    village: 'Binnamangala',
    taluk: 'Devanahalli',
    district: 'Bengaluru Urban',
    landArea: '2 Acres 14 Guntas',
    recordType: 'Sale Deed / RoR',
    status: 'Under Review',
    lastUpdated: '08 Sep 2026',
    soilClassification: 'Dry Agricultural (Bagayat)',
    annualTax: '₹ 140.00 / annum',
    gpsCentroid: '13.2438° N, 77.7126° E',
    documents: [
      { title: 'Registered Sale Deed Doc #8819/2026', type: 'Deed', date: '08 Sep 2026', verified: true },
      { title: 'Bhoomi Mutation Extract MR-104/2026', type: 'Mutation', date: '07 Sep 2026', verified: false },
      { title: 'Cadastral Survey Map Sheet #4', type: 'Map', date: '15 Aug 2025', verified: true },
    ],
    ownershipHistory: [
      {
        year: '2026',
        type: 'Sale Deed Verification',
        description: 'Conveyance executed from Basavaraj K. Gowda to Savitha M. Ranganath',
        parties: 'Basavaraj K. Gowda → Savitha M. Ranganath',
        documentRef: 'Deed #BLR-2026-8819',
      },
      {
        year: '2023',
        type: 'Mutation Recorded',
        description: 'Partition mutation pursuant to Family Settlement Deed registered at Devanahalli',
        parties: 'Gowda Family Partition Settlement',
        documentRef: 'MR #KA-DEV-2023-41',
      },
      {
        year: '2018',
        type: 'Ownership Transfer',
        description: 'Inheritance mutation sanctioned by Tahsildar post probate grant',
        parties: 'Late K. Kempegowda → Basavaraj K. Gowda',
        documentRef: 'Inheritance Order #77/2018',
      },
    ],
    verificationHistory: [
      {
        date: '08 Sep 2026, 10:24 AM',
        officer: 'Officer Rajesh Kumar',
        outcome: 'AI Pre-check Complete',
        remarks: 'AI-assisted element detection completed; text, tables, signatures, stamps isolated.',
      },
      {
        date: '07 Sep 2026, 04:10 PM',
        officer: 'Revenue Inspector H. S. Murthy',
        outcome: 'Physical Boundary Verified',
        remarks: 'Cadastral boundaries match physical stone markers at site.',
      },
    ],
  },
  {
    recordId: 'REC-KA-MYS-42B',
    surveyNo: '42/3',
    ownerName: 'Ramesh C. Patil',
    fatherOrHusbandName: 'Channappa Patil',
    village: 'Biligere',
    taluk: 'Hunsur',
    district: 'Mysuru',
    landArea: '1 Acre 20 Guntas',
    recordType: 'Mutation Record',
    status: 'Under Review',
    lastUpdated: '07 Sep 2026',
    soilClassification: 'Wet Irrigated (Tari)',
    annualTax: '₹ 95.00 / annum',
    gpsCentroid: '12.3082° N, 76.2911° E',
    documents: [
      { title: 'Mutation Sanction Order #4412/2026', type: 'Mutation', date: '07 Sep 2026', verified: false },
      { title: 'RTC Form 16 Current Year', type: 'RTC', date: '01 Aug 2026', verified: true },
    ],
    ownershipHistory: [
      {
        year: '2026',
        type: 'Mutation Review',
        description: 'Sub-division mutation submitted post boundary re-alignment',
        parties: 'Ramesh C. Patil',
        documentRef: 'Case #MYS-2026-4412',
      },
      {
        year: '2021',
        type: 'Agricultural Loan Hypothecation',
        description: 'Charge created in favour of Karnataka Gramin Bank',
        parties: 'Ramesh C. Patil ↔ KGB Hunsur Branch',
        documentRef: 'Charge #KGB-2021-098',
      },
      {
        year: '2015',
        type: 'Purchase Conveyance',
        description: 'Purchased through registered sale deed',
        parties: 'Siddaraju → Ramesh C. Patil',
        documentRef: 'Deed #MYS-15-4421',
      },
    ],
    verificationHistory: [
      {
        date: '07 Sep 2026, 04:31 PM',
        officer: 'Officer Rajesh Kumar',
        outcome: 'Flagged for Area Discrepancy',
        remarks: 'Marginal 0.04 Gunta variance flagged between index text and schedule table.',
      },
    ],
  },
  {
    recordId: 'REC-KA-TMK-88A',
    surveyNo: '88/1',
    ownerName: 'Gangadhar N. Swamy',
    fatherOrHusbandName: 'Nanjunda Swamy',
    village: 'Kibbanahalli',
    taluk: 'Tiptur',
    district: 'Tumakuru',
    landArea: '3 Acres 02 Guntas',
    recordType: 'RTC Record',
    status: 'Verified',
    lastUpdated: '07 Sep 2026',
    soilClassification: 'Coconut Bagayat (Garden)',
    annualTax: '₹ 210.00 / annum',
    gpsCentroid: '13.2592° N, 76.4789° E',
    documents: [
      { title: 'RTC Pahani Certificate #3190', type: 'RTC', date: '07 Sep 2026', verified: true },
      { title: 'Aadhaar Seeded Title Extract', type: 'KYC', date: '12 May 2025', verified: true },
    ],
    ownershipHistory: [
      {
        year: '2026',
        type: 'Periodic Bhoomi Digital Re-verification',
        description: 'Full automated and officer verified record concordance',
        parties: 'Gangadhar N. Swamy',
        documentRef: 'Case #TMK-2026-3190',
      },
      {
        year: '2019',
        type: 'Title Updation',
        description: 'Correction of survey sub-number from Sy 88 to Sy 88/1',
        parties: 'Revenue Department Order',
        documentRef: 'Tahsildar Order #TMK-19-112',
      },
    ],
    verificationHistory: [
      {
        date: '07 Sep 2026, 11:15 AM',
        officer: 'Officer Rajesh Kumar',
        outcome: 'Verified & Approved',
        remarks: 'Complete concordance with Bhoomi state database. Digitally sealed.',
      },
    ],
  },
  {
    recordId: 'REC-KA-BLG-15B',
    surveyNo: '15/B',
    ownerName: 'Suresh & Brothers',
    fatherOrHusbandName: 'Mallappa Patil',
    village: 'Mamdapur',
    taluk: 'Gokak',
    district: 'Belagavi',
    landArea: '4 Acres 10 Guntas',
    recordType: 'Partition Deed',
    status: 'Flagged',
    lastUpdated: '06 Sep 2026',
    soilClassification: 'Black Cotton Dry Soil',
    annualTax: '₹ 180.00 / annum',
    gpsCentroid: '16.1684° N, 74.8239° E',
    documents: [
      { title: 'Partition Deed Doc #1044/2026', type: 'Partition', date: '06 Sep 2026', verified: false },
    ],
    ownershipHistory: [
      {
        year: '2026',
        type: 'Partition Claim Disputed',
        description: 'Sum of allocated shares exceeds registered parental title acreage',
        parties: 'Suresh Patil, Prakash Patil, Anand Patil',
        documentRef: 'Dispute #BLG-2026-1044',
      },
      {
        year: '2012',
        type: 'Ancestral Settlement',
        description: 'Patil ancestral joint family record entry',
        parties: 'Patil Ancestral Lineage',
        documentRef: 'RoR Archive #KA-BLG-2012',
      },
    ],
    verificationHistory: [
      {
        date: '06 Sep 2026, 04:30 PM',
        officer: 'Officer Rajesh Kumar',
        outcome: 'Flagged / Manual Adjudication',
        remarks: 'Sum of parcel sub-divisions (4.45 A) exceeds total extent (4.10 A). Re-survey required.',
      },
    ],
  },
  {
    recordId: 'REC-KA-MND-210B',
    surveyNo: '210/2',
    ownerName: 'Manjunath K. V.',
    fatherOrHusbandName: 'Venkatesh Gowda',
    village: 'Shivapura',
    taluk: 'Maddur',
    district: 'Mandya',
    landArea: '1 Acre 35 Guntas',
    recordType: 'Sale Deed',
    status: 'Verified',
    lastUpdated: '05 Sep 2026',
    soilClassification: 'Canal Irrigated Sugarcane Land',
    annualTax: '₹ 160.00 / annum',
    gpsCentroid: '12.5839° N, 77.0421° E',
    documents: [
      { title: 'Sale Deed Registered Doc #7201', type: 'Deed', date: '05 Sep 2026', verified: true },
      { title: 'Encumbrance Certificate 2011-2026', type: 'EC', date: '04 Sep 2026', verified: true },
    ],
    ownershipHistory: [
      {
        year: '2026',
        type: 'Sale Deed Registration & Officer Sign-off',
        description: 'Clear title conveyance with Nil encumbrance validated',
        parties: 'Chikkanna → Manjunath K. V.',
        documentRef: 'Case #MND-2026-7201',
      },
      {
        year: '2016',
        type: 'Mutation Sanction',
        description: 'Sanction of mutation pursuant to partition decree',
        parties: 'Civil Court Maddur Decree #88/2015',
        documentRef: 'MR #MND-16-55',
      },
    ],
    verificationHistory: [
      {
        date: '05 Sep 2026, 11:20 AM',
        officer: 'Officer Rajesh Kumar',
        outcome: 'Verified & Approved',
        remarks: '15-year encumbrance search verified clean. Title officially updated.',
      },
    ],
  },
];

const RECORDS_STORAGE_KEY = 'bhusatya_records_v3';

export function getRecords(): LandRecord[] {
  try {
    const saved = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load records from localStorage, using initial data:', e);
  }
  localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(INITIAL_RECORDS));
  return INITIAL_RECORDS;
}

export function getRecordById(recordId: string): LandRecord | undefined {
  const records = getRecords();
  return records.find(
    (r) =>
      r.recordId.toLowerCase() === recordId.toLowerCase() ||
      r.surveyNo.toLowerCase() === recordId.toLowerCase()
  );
}
