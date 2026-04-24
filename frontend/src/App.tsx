import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ApplicantPage from './pages/ApplicantPage';
import HrPage from './pages/HrPage';
import HrDashboardPage from './pages/HrDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/applicant" replace />} />
        <Route path="/applicant" element={<ApplicantPage />} />
        <Route path="/hr" element={<HrDashboardPage />} />
        <Route path="/hr/analyze" element={<HrPage />} />
      </Routes>
    </BrowserRouter>
  );
}
