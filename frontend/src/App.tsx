import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ApplicantPage from './pages/ApplicantPage';
import HrPage from './pages/HrPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/applicant" replace />} />
        <Route path="/applicant" element={<ApplicantPage />} />
        <Route path="/hr" element={<HrPage />} />
      </Routes>
    </BrowserRouter>
  );
}
