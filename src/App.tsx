import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Dataloggers from './pages/Dataloggers';
import UsageManagement from './pages/UsageManagement';
import CalibrationTracking from './pages/CalibrationTracking';
import AuditTrail from './pages/AuditTrail';
import UserManagement from './pages/UserManagement';
import './App.css'
import './firebase/config.ts';
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className=" min-h-screen bg-darkBg text-darkText dark transition-colors duration-300">
          <Navigation />
          <div className="w-full max-w-[2000px] mx-auto">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/dataloggers" element={<Dataloggers />} />
              <Route path="/usage" element={<UsageManagement />} />
              <Route path="/calibration" element={<CalibrationTracking />} />
              <Route path="/audit" element={<AuditTrail />} />
              <Route path="/users" element={<UserManagement />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
