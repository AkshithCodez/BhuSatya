// TypeScript interfaces matching backend schemas

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  full_name: string;
  role: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

export interface DocumentOut {
  id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number | null;
  status: string;
  village: string | null;
  khasra_number: string | null;
  risk_score: number | null;
  risk_level: string | null;
  created_at: string | null;
  updated_at: string | null;
  page_count: number;
}

export interface BBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  id: string;
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: BBox;
  image_width: number;
  image_height: number;
}

export interface DetectionResponse {
  document_id: number;
  page: number;
  model: string;
  confidence_threshold: number;
  detections: Detection[];
}

export interface Region {
  id: number;
  detection_id: number;
  document_id: number;
  page_number: number;
  class_name: string;
  crop_path: string;
  crop_url: string;
  crop_width: number | null;
  crop_height: number | null;
}

export interface ExtractedField {
  id: number;
  document_id: number;
  field_name: string;
  value: string | null;
  normalized_value: string | null;
  unit: string | null;
  confidence: number | null;
  source_page: number | null;
  source_detection_id: string | null;
  source_text: string | null;
  extraction_method: string | null;
  verification_status: string;
}

export interface EvidenceItem {
  source: string;
  value: string;
}

export interface ValidationResult {
  id?: number;
  rule: string;
  status: string;
  severity: string | null;
  message: string;
  uploaded_value: string | null;
  evidence: EvidenceItem[];
  recommendation: string | null;
}

export interface ValidationResponse {
  document_id: number;
  risk_score: number;
  risk_level: string;
  results: ValidationResult[];
}

export interface DashboardStats {
  total_documents: number;
  processed: number;
  needs_review: number;
  verified: number;
  high_risk: number;
}

export interface RecentDocument {
  id: number;
  original_filename: string;
  village: string | null;
  khasra_number: string | null;
  created_at: string | null;
  risk_level: string | null;
  status: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recent_documents: RecentDocument[];
}

export interface AuditEvent {
  id: number;
  document_id: number | null;
  event_type: string;
  description: string;
  details: string | null;
  user_id: number | null;
  created_at: string | null;
}

export interface ReviewQueueItem {
  id: number;
  original_filename: string;
  village: string | null;
  khasra_number: string | null;
  risk_score: number | null;
  risk_level: string | null;
  status: string;
  created_at: string | null;
}

export interface TimelineEvent {
  year: string;
  event_type: string;
  description: string;
  details?: Record<string, unknown>;
}

export interface ParcelOut {
  id: number;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  khata_number: string | null;
  khasra_number: string;
  area: number | null;
  area_unit: string;
  land_classification?: string | null;
  gis_area: number | null;
  gis_area_unit?: string | null;
  gis_polygon: string | null;
  current_holders: { name: string; share: string }[];
}

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  data?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}
