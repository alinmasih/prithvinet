import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

import Layout from './layout/Layout';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import MonitoringDashboard from './pages/MonitoringDashboard';
import Reports from './pages/Reports';

// Basic components for routes (to be expanded)
import AdminDashboard from './pages/AdminDashboard';
import RegionalOfficerDashboard from './pages/RegionalOfficerDashboard';
import MonitoringTeamDashboard from './pages/MonitoringTeamDashboard';
import IndustryDashboard from './pages/IndustryDashboard';
import CitizenComplaint from './pages/CitizenComplaint';
import AICopilot from './pages/AICopilot';
import ThreeDSimulation from './pages/ThreeDSimulation';
import Login from './pages/Login';
import Stations from './pages/Stations';
import Industries from './pages/Industries';
import Alerts from './pages/Alerts';
import UserManagement from './pages/UserManagement';
import WaterSources from './pages/WaterSources';
import EntityManagement from './pages/EntityManagement';
import PublicDashboard from './pages/PublicDashboard';
import IndustryRegistrationChoice from './pages/IndustryRegistrationChoice';
import IndustryIntimationForm from './pages/IndustryIntimationForm';
import SubmitOfficialForm from './pages/SubmitOfficialForm';
import MapPage from './pages/MapPage';
import UploadReport from './pages/UploadReport';
import RegionalOfficesList from './pages/RegionalOfficesList';


import CityMapPage from './pages/CityMapPage';
import Register from './pages/Register';

const Unauthorized = () => <div className="p-10 text-white text-rose-500">Unauthorized Access</div>;

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/citymap" element={<CityMapPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/public-dashboard" element={<PublicDashboard />} />
            <Route path="/ai-copilot" element={<Layout><AICopilot /></Layout>} />
            <Route path="/register-industry/new" element={<IndustryIntimationForm />} />
            <Route path="/register-industry/submit" element={<SubmitOfficialForm />} />
            <Route path="/register-industry" element={<IndustryRegistrationChoice />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
              <Route path="/industries" element={<Layout><Industries /></Layout>} />
              <Route path="/alerts" element={<Layout><Alerts /></Layout>} />
              <Route path="/reports" element={<Layout><Reports /></Layout>} />
              <Route path="/reports/:type" element={<Layout><Reports /></Layout>} />
              <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
              <Route path="/regional" element={<Layout><RegionalOfficesList /></Layout>} />
              <Route path="/regional/:id" element={<Layout><RegionalOfficerDashboard /></Layout>} />
              <Route path="/monitoring" element={<Layout><MonitoringTeamDashboard /></Layout>} />
              <Route path="/industry" element={<Layout><IndustryDashboard /></Layout>} />
              <Route path="/upload-report" element={<Layout><UploadReport /></Layout>} />
              <Route path="/users" element={<Layout><UserManagement /></Layout>} />
              <Route path="/entities" element={<Layout><EntityManagement /></Layout>} />
              <Route path="/complaint" element={<Layout><CitizenComplaint /></Layout>} />

            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
