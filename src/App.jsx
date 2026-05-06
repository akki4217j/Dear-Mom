import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import MomDashboard from './pages/MomDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import MoodTracker from './pages/MoodTracker';
import DailyTasks from './pages/DailyTasks';
import RelaxPage from './pages/RelaxPage';
import ReportPage from './pages/ReportPage';
import DoctorLocator from './pages/DoctorLocator';
import AskMe from './pages/AskMe';
import CoupleGames from './pages/CoupleGames';
import MemoryBook from './pages/MemoryBook';

const Layout = ({ children }) => {
  const location = useLocation();
  const publicPaths = ['/', '/login', '/signup', '/forgot-password'];
  const isPublic = publicPaths.includes(location.pathname) || location.pathname.startsWith('/reset-password');

  return (
    <div className="min-h-screen bg-rose-50 font-body">
      {!isPublic && <Navbar />}
      <main>{children}</main>
      {!isPublic && <BottomNav />}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Layout>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Mom Routes */}
              <Route path="/mom/dashboard" element={<ProtectedRoute allowedRole="mom"><MomDashboard /></ProtectedRoute>} />
              <Route path="/mom/mood" element={<ProtectedRoute allowedRole="mom"><MoodTracker /></ProtectedRoute>} />
              <Route path="/mom/tasks" element={<ProtectedRoute allowedRole="mom"><DailyTasks /></ProtectedRoute>} />
              <Route path="/mom/relax" element={<ProtectedRoute allowedRole="mom"><RelaxPage /></ProtectedRoute>} />
              <Route path="/mom/report" element={<ProtectedRoute allowedRole="mom"><ReportPage /></ProtectedRoute>} />
              <Route path="/mom/doctor" element={<ProtectedRoute allowedRole="mom"><DoctorLocator /></ProtectedRoute>} />
              <Route path="/mom/askme" element={<ProtectedRoute allowedRole="mom"><AskMe /></ProtectedRoute>} />
              <Route path="/mom/games" element={<ProtectedRoute allowedRole="mom"><CoupleGames /></ProtectedRoute>} />
              <Route path="/mom/memory" element={<ProtectedRoute allowedRole="mom"><MemoryBook /></ProtectedRoute>} />

              {/* Partner Routes */}
              <Route path="/partner/dashboard" element={<ProtectedRoute allowedRole="partner"><PartnerDashboard /></ProtectedRoute>} />
              <Route path="/partner/games" element={<ProtectedRoute allowedRole="partner"><CoupleGames /></ProtectedRoute>} />
              <Route path="/partner/memory" element={<ProtectedRoute allowedRole="partner"><MemoryBook /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

