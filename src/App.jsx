import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
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

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, role } = useAuth();

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

const AdminRedirect = () => {
  const { user, role } = useAuth();
  if (user && role === 'admin') {
    return <Navigate to="/dashboard/admin" replace />;
  }
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminRedirect />} />
          
          {/* Protected Dashboard Layout (Requires any login) */}
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
