import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClassManagement from './pages/admin/ClassManagement';
import StudentAdmission from './pages/admin/StudentAdmission';
import TeacherManagement from './pages/admin/TeacherManagement';
import StudentManagement from './pages/admin/StudentManagement';
import ExpenseTracking from './pages/admin/ExpenseTracking';
import FeeCollection from './pages/admin/FeeCollection';
import NoticeBoard from './pages/admin/NoticeBoard';
import RoutineManagement from './pages/admin/RoutineManagement';
import SettingsPage from './pages/admin/SettingsPage';
import ReportsPage from './pages/admin/ReportsPage';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MarkEntry from './pages/teacher/MarkEntry';
import AttendanceTracking from './pages/teacher/AttendanceTracking';
import StudentDashboard from './pages/student/StudentDashboard';

/** Full-screen loading spinner shown while the auth session is being resolved */
const AuthLoadingSpinner = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
      <p className="text-slate-400 text-sm">সেশন লোড হচ্ছে...</p>
    </div>
  </div>
);

/**
 * Guards a route — waits for auth loading, then enforces login + role checks.
 * allowedRoles: if provided, only those roles can access the outlet.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, role, loading } = useAuth();

  // Don't flash to /login before session is resolved
  if (loading) return <AuthLoadingSpinner />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'admin') return <Navigate to="/dashboard/admin" replace />;
    if (role === 'teacher') return <Navigate to="/dashboard/teacher" replace />;
    if (role === 'student') return <Navigate to="/dashboard/student" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

/**
 * Smart redirect at /dashboard — sends user to their role-based dashboard.
 */
const DashboardRedirect = () => {
  const { user, role, loading } = useAuth();
  if (loading) return <AuthLoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/dashboard/admin" replace />;
  if (role === 'teacher') return <Navigate to="/dashboard/teacher" replace />;
  if (role === 'student') return <Navigate to="/dashboard/student" replace />;
  return <Navigate to="/login" replace />;
};

/** Redirects /admin shortcut for admins */
const AdminRedirect = () => {
  const { user, role, loading } = useAuth();
  if (loading) return <AuthLoadingSpinner />;
  if (user && role === 'admin') return <Navigate to="/dashboard/admin" replace />;
  return <Navigate to="/login" replace />;
};

/** Redirect already-logged-in users away from /login */
const GuestRoute = ({ children }) => {
  const { user, role, loading } = useAuth();
  if (loading) return <AuthLoadingSpinner />;
  if (user) {
    if (role === 'admin') return <Navigate to="/dashboard/admin" replace />;
    if (role === 'teacher') return <Navigate to="/dashboard/teacher" replace />;
    if (role === 'student') return <Navigate to="/dashboard/student" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminRedirect />} />

          {/* Dashboard root — role-based redirect */}
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Protected Dashboard Layout */}
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>

              {/* Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/classes" element={<ClassManagement />} />
                <Route path="admin/admissions" element={<StudentManagement />} />
                <Route path="admin/teachers" element={<TeacherManagement />} />
                <Route path="admin/students" element={<StudentManagement />} />
                <Route path="admin/expenses" element={<ExpenseTracking />} />
                <Route path="admin/fees" element={<FeeCollection />} />
                <Route path="admin/notices" element={<NoticeBoard />} />
                <Route path="admin/routine" element={<RoutineManagement />} />
                <Route path="admin/settings" element={<SettingsPage />} />
                <Route path="admin/reports" element={<ReportsPage />} />
              </Route>

              {/* Teacher Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
                <Route path="teacher" element={<TeacherDashboard />} />
                <Route path="teacher/marks" element={<MarkEntry />} />
                <Route path="teacher/attendance" element={<AttendanceTracking />} />
              </Route>

              {/* Student Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="student" element={<StudentDashboard />} />
              </Route>

            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
