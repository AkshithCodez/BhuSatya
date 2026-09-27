import axios from 'axios';
import type {
  LoginRequest, LoginResponse, DocumentOut, DetectionResponse,
  Region, ExtractedField, ValidationResponse, DashboardResponse,
  AuditEvent, ReviewQueueItem, ParcelOut, TimelineEvent, GraphNode, GraphEdge,
  VerifiedRecordResponse,
} from '../types';

const api = axios.create({ baseURL: '/api' });

// Inject auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (data: LoginRequest) =>
  api.post<LoginResponse>('/auth/login', data).then(r => r.data);

// Dashboard
export const getDashboard = () =>
  api.get<DashboardResponse>('/dashboard').then(r => r.data);

// Documents
export const uploadDocument = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api.post<DocumentOut>('/documents', form).then(r => r.data);
};
export const getDocuments = () =>
  api.get<{ documents: DocumentOut[]; total: number }>('/documents').then(r => r.data);
export const getDocument = (id: number) =>
  api.get<DocumentOut>(`/documents/${id}`).then(r => r.data);

// Detections & Manual Region
export const detectLayout = (docId: number) =>
  api.post<DetectionResponse[]>(`/documents/${docId}/detect`).then(r => r.data);
export const getDetections = (docId: number) =>
  api.get<Detection[]>(`/documents/${docId}/detections`).then(r => r.data);
export const getRegions = (docId: number) =>
  api.get<Region[]>(`/documents/${docId}/regions`).then(r => r.data);
export const createManualRegion = (
  docId: number,
  data: {
    page_number: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    image_width: number;
    image_height: number;
    region_type?: string;
  }
) => api.post<Region>(`/documents/${docId}/manual-region`, data).then(r => r.data);

// Extraction
export const extractTable = (regionId: number, text?: string) =>
  api.post(`/regions/${regionId}/extract`, text ? { text } : null).then(r => r.data);
export const parseFields = (docId: number) =>
  api.post<ExtractedField[]>(`/documents/${docId}/parse`).then(r => r.data);
export const getFields = (docId: number) =>
  api.get<ExtractedField[]>(`/documents/${docId}/fields`).then(r => r.data);

// Validation
export const validateDocument = (docId: number) =>
  api.post<ValidationResponse>(`/documents/${docId}/validate`).then(r => r.data);
export const getValidation = (docId: number) =>
  api.get<ValidationResponse>(`/documents/${docId}/validation`).then(r => r.data);

// Review & Officer Corrections
export const updateField = (fieldId: number, value: string, reason?: string) =>
  api.put<ExtractedField>(`/fields/${fieldId}`, { value, reason }).then(r => r.data);
export const updateFieldStatus = (
  fieldId: number,
  status: 'CONFIRMED' | 'FLAGGED' | 'CORRECTED' | 'UNREADABLE' | 'NOT_APPLICABLE'
) =>
  api.put<ExtractedField>(`/fields/${fieldId}/status`, null, { params: { status } }).then(r => r.data);
export const submitReview = (docId: number, action: string, notes?: string) =>
  api.post(`/documents/${docId}/review`, { action, notes }).then(r => r.data);
export const approveDocument = (docId: number, data?: { notes?: string; override_reason?: string }) =>
  api.post(`/documents/${docId}/approve`, data || {}).then(r => r.data);
export const rejectDocument = (docId: number, reason: string) =>
  api.post(`/documents/${docId}/reject`, { reason }).then(r => r.data);
export const investigateDocument = (docId: number, reason: string) =>
  api.post(`/documents/${docId}/investigate`, { reason }).then(r => r.data);
export const getReviewQueue = () =>
  api.get<ReviewQueueItem[]>('/review-queue').then(r => r.data);
export const getVerifiedRecord = (docId: number) =>
  api.get<VerifiedRecordResponse>(`/documents/${docId}/verified-record`).then(r => r.data);
export const exportDocument = (docId: number) =>
  api.get(`/documents/${docId}/export`).then(r => r.data);

// Parcels
export const getParcels = () =>
  api.get<ParcelOut[]>('/parcels').then(r => r.data);
export const getParcel = (id: number) =>
  api.get<ParcelOut>(`/parcels/${id}`).then(r => r.data);
export const getParcelTimeline = (id: number) =>
  api.get<{ events: TimelineEvent[] }>(`/parcels/${id}/timeline`).then(r => r.data);
export const getParcelGraph = (id: number) =>
  api.get<{ nodes: GraphNode[]; edges: GraphEdge[] }>(`/parcels/${id}/graph`).then(r => r.data);

// Audit
export const getAuditEvents = (docId?: number) =>
  api.get<{ events: AuditEvent[]; total: number }>('/audit', {
    params: docId ? { document_id: docId } : {},
  }).then(r => r.data);

// Helper: page image URL
export const getPageImageUrl = (docId: number, page: number) =>
  `/api/documents/${docId}/page/${page}/image`;
export const getRegionImageUrl = (regionId: number) =>
  `/api/regions/${regionId}/image`;

import type { Detection } from '../types';
