import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar          from './components/Navbar';
import ProtectedRoute  from './components/ProtectedRoute';
import RoleRoute       from './components/RoleRoute';
import LoadingSpinner  from './components/LoadingSpinner';

import Welcome          from './pages/Welcome';
import Login            from './pages/Login';
import Register         from './pages/Register';
import Home             from './pages/Home';
import About            from './pages/About';
import Profile          from './pages/Profile';
import ReclamationPage  from './pages/ReclamationPage';
import AdminDashboard   from './pages/admin/AdminDashboard';
import ChefDashboard    from './pages/chef/ChefDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';

import './App.css';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <>
      {/* Show navbar only when authenticated */}
      {user && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route path="/"         element={user ? <Navigate to="/home" replace /> : <Welcome />} />
        <Route path="/login"    element={user ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/home" replace /> : <Register />} />

        {/* Shared protected routes */}
        <Route path="/home"    element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/about"   element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Citoyen */}
        <Route path="/reclamations" element={
          <RoleRoute roles={['citoyen', 'admin']}>
            <ReclamationPage />
          </RoleRoute>
        } />

        {/* Admin */}
        <Route path="/admin/*" element={
          <RoleRoute roles={['admin']}>
            <AdminDashboard />
          </RoleRoute>
        } />

        {/* Chef Service */}
        <Route path="/chef" element={
          <RoleRoute roles={['chef_dep', 'admin']}>
            <ChefDashboard />
          </RoleRoute>
        } />

        {/* Employee */}
        <Route path="/employee" element={
          <RoleRoute roles={['employe', 'admin']}>
            <EmployeeDashboard />
          </RoleRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? '/home' : '/'} replace />} />
      </Routes>
    </>
  );
}
