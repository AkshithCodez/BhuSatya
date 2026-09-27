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
  model_name?: string;
  model_role?: string;
  model_version?: string;
  document_page_id?: number | null;
}

export interface DetectionResponse {
  document_id: number;
  page: number;
  model: string;
  confidence_threshold: number;
  detections: Detection[];
  models_status?: Record<string, string>;
  fused_regions?: Region[];
}

export interface Region {
  id: number;
  detection_id: number | null;
  document_id: number;
  page_number: number;
  class_name: string;
  source?: string;
  supporting_detection_ids?: string | null;
  region_type?: string;
  x1?: number | null;
  y1?: number | null;
  x2?: number | null;
  y2?: number | null;
  image_width?: number | null;
  image_height?: number | null;
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
  raw_value?: string | null;
  normalized_value: string | null;
  unit: string | null;
  confidence: number | null;
  source_page: number | null;
  source_detection_id: string | null;
  source_region_id?: number | null;
  table_extraction_id?: number | null;
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
  document_id?: number;
  extracted_field_id?: number | null;
  rule: string;
  rule_code?: string | null;
  status: string;
  severity: string | null;
  message: string;
  uploaded_value: string | null;
  reference_values?: Record<string, any> | null;
  evidence: EvidenceItem[];
  recommendation: string | null;
}

export interface ValidationResponse {
  document_id: number;
  risk_score: number | null;
  risk_level: string;
  results: ValidationResult[];
}

export interface VerifiedRecordResponse {
  document_id: number;
  verification_status: string;
  is_verified: boolean;
  fields: Record<string, string | null>;
  extracted_fields?: Array<{
    field_id?: number;
    field_name: string;
    raw_value: string | null;
    effective_value: string | null;
    confidence?: number | null;
    verification_status: string;
  }>;
  corrections?: Array<{
    id?: number;
    field_name: string;
    previous_value: string | null;
    new_value: string;
    reason: string;
    changed_by: string | null;
    changed_at: string | null;
  }>;
  review?: {
    reviewer_id: number | null;
    reviewer_name: string;
    decision: string;
    notes: string | null;
    reviewed_at: string | null;
  } | null;
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
