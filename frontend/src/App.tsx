import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import DocumentAnalysisPage from './pages/DocumentAnalysisPage';
import ReviewQueuePage from './pages/ReviewQueuePage';
import OfficerReviewPage from './pages/OfficerReviewPage';
import ParcelPage from './pages/ParcelPage';
import AuditPage from './pages/AuditPage';
import './index.css';

function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/upload" element={token ? <Navigate to="/app/upload" /> : <Navigate to="/login" />} />

        {/* Authenticated App */}
        <Route path="/app" element={token ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<DashboardPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="documents/:id" element={<DocumentAnalysisPage />} />
          <Route path="review-queue" element={<ReviewQueuePage />} />
          <Route path="review/:id" element={<OfficerReviewPage />} />
          <Route path="parcels" element={<ParcelPage />} />
          <Route path="audit" element={<AuditPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
