import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './css/global-layout.css';

// Import pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WelcomeIntro from './components/WelcomeIntro';
import Clients from './pages/Clients';
import ClientCreation from './pages/ClientCreation';
import Accreditation from './pages/Accreditation';
import ProjectManagement from './pages/ProjectManagement';
import SLAPreview from './pages/SLAPreview';
import SkillsProgram from './pages/SkillsProgram';
import ContractCreation from './pages/ContractCreation';
import Facilitator from './pages/Facilitator';
import Timetable from './pages/Timetable';
import Leads from './pages/Leads';
import Reports from './pages/Reports';
import Programs from './pages/Programs';

// Import context and components for protected routes
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/welcome-intro" element={<WelcomeIntro onComplete={() => {}} />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
            <Route path="/client-creation" element={<ProtectedRoute><ClientCreation /></ProtectedRoute>} />
            <Route path="/accreditation" element={<ProtectedRoute><Accreditation /></ProtectedRoute>} />
            <Route path="/skills-program" element={<ProtectedRoute><SkillsProgram /></ProtectedRoute>} />
            <Route path="/contract-creation" element={<ProtectedRoute><ContractCreation /></ProtectedRoute>} />
            <Route path="/wsp-training" element={<ProtectedRoute><ProjectManagement /></ProtectedRoute>} />
            <Route path="/sla-preview" element={<ProtectedRoute><SLAPreview /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/programs" element={<ProtectedRoute><Programs /></ProtectedRoute>} />
            <Route path="/facilitator" element={<ProtectedRoute><Facilitator /></ProtectedRoute>} />
            <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
            <Route path="*" element={<Login />} />
          </Routes>
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;
