import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Register from './components/Register';
import JobList from './components/JobList';
import JobPost from './components/JobPost';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './components/Home';
import MyApplications from './components/MyApplications';
// Admin components
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import PostJobForm from './components/Admin/PostJobForm';
import JobListAdmin from './components/Admin/JobList';
import ViewResumes from './components/Admin/ViewResumes';
import jwt_decode from 'jwt-decode';
import AdminNavbar from './components/AdminNavbar';
import { useLocation } from 'react-router-dom';
import Companies from './components/Companies';
import About from './components/About';
import CompanyForm from './components/Admin/CompanyForm';
import UserProfileForm from './components/UserProfileForm';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function ProtectedRoute({ role, children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/admin/login" />;
  try {
    const decoded = jwt_decode(token);
    if (role && decoded.role !== role) {
      return <div style={{padding: 40, textAlign: 'center', color: 'red', fontWeight: 600}}>Unauthorized: {role} only</div>;
    }
    return children;
  } catch {
    return <Navigate to="/admin/login" />;
  }
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  return (
    <>
      {isAdminRoute ? <AdminNavbar /> : <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobPost />} />
        <Route path="/my-applications" element={<MyApplications />} />
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/companies" element={<Companies />} />
        {/* Redirect /admin to / for admin home */}
        <Route path="/admin" element={<Navigate to="/" />} />
        {/* About/Services route */}
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Navigate to="/about" />} />
        <Route path="/profile" element={<UserProfileForm />} />
        <Route path="/edit-profile" element={<UserProfileForm editMode={true} />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
