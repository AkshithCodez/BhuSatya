import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PortalLayout from './components/layout/PortalLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OfficerDashboard from './pages/OfficerDashboard';
import UploadPage from './pages/UploadPage';
import ProcessingPage from './pages/ProcessingPage';
import DedicatedAnalysisPage from './pages/DedicatedAnalysisPage';
import VerificationCasesPage from './pages/VerificationCasesPage';
import VerificationCaseDetailPage from './pages/VerificationCaseDetailPage';
import LandRecordsPage from './pages/LandRecordsPage';
import LandRecordDetailPage from './pages/LandRecordDetailPage';
import ReportsPage from './pages/ReportsPage';
import AuditTrailPage from './pages/AuditTrailPage';
import SettingsPage from './pages/SettingsPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Sign-in Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Unified Officer Portal (Single Sidebar + Clean Topbar) */}
        <Route element={<PortalLayout />}>
          <Route path="/dashboard" element={<OfficerDashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/processing" element={<ProcessingPage />} />
          <Route path="/analysis" element={<DedicatedAnalysisPage />} />
          <Route path="/analysis/:caseId" element={<DedicatedAnalysisPage />} />
          <Route path="/verification" element={<VerificationCasesPage />} />
          <Route path="/verification/:caseId" element={<VerificationCaseDetailPage />} />
          <Route path="/land-records" element={<LandRecordsPage />} />
          <Route path="/land-records/:recordId" element={<LandRecordDetailPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/audit-trail" element={<AuditTrailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Backward-Compatible Redirects */}
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />
        <Route path="/app/upload" element={<Navigate to="/upload" replace />} />
        <Route path="/app/review-queue" element={<Navigate to="/verification" replace />} />
        <Route path="/app/parcels" element={<Navigate to="/land-records" replace />} />
        <Route path="/app/audit" element={<Navigate to="/audit-trail" replace />} />
        <Route path="/app/documents/:id" element={<Navigate to="/analysis" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
