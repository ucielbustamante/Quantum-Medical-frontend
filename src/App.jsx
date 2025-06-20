import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AuthSuccess from './pages/auth/AuthSuccess';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from './pages/admin/Dashboard';
import DoctorDashboard from './pages/doctor/Dashboard';
import PatientDashboard from './pages/patient/Dashboard';
import Users from './pages/admin/Users';
import Doctors from './pages/admin/Doctors';
import Patients from './pages/admin/Patients';
import Specialties from './pages/admin/Specialties';
import Appointments from './pages/admin/Appointments';
import ClinicalRecords from './pages/admin/ClinicalRecords';
import Documents from './pages/admin/Documents';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorPatients from './pages/doctor/Patients';
import DoctorAvailability from './pages/doctor/Availability';
import PatientAppointments from './pages/patient/Appointments';
import PatientDoctors from './pages/patient/Doctors';
import PatientClinicalRecords from './pages/patient/ClinicalRecords';
import PatientDocuments from './pages/patient/Documents';
import BookAppointment from './pages/patient/BookAppointment';
import LoadingSpinner from './components/common/LoadingSpinner';
import DoctorClinicalRecords from './pages/doctor/ClinicalRecords';
import DoctorDocuments from './pages/doctor/Documents';

// Componente Dashboard que redirige según el rol
const Dashboard = () => {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'Admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'Doctor':
      return <Navigate to="/doctor/dashboard" replace />;
    case 'Patient':
      return <Navigate to="/patient/dashboard" replace />;
    default:
      return <Navigate to="/auth/login" replace />;
  }
};

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/auth/login" element={<LoginForm />} />
      <Route path="/auth/register" element={<RegisterForm />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route path="/auth/success" element={<AuthSuccess />} />
      
      {/* Rutas protegidas */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Dashboard por defecto */}
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Rutas de Admin */}
        <Route path="admin" element={<ProtectedRoute roles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/dashboard" element={<ProtectedRoute roles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute roles={['Admin']}><Users /></ProtectedRoute>} />
        <Route path="admin/doctors" element={<ProtectedRoute roles={['Admin']}><Doctors /></ProtectedRoute>} />
        <Route path="admin/patients" element={<ProtectedRoute roles={['Admin']}><Patients /></ProtectedRoute>} />
        <Route path="admin/specialties" element={<ProtectedRoute roles={['Admin']}><Specialties /></ProtectedRoute>} />
        <Route path="admin/appointments" element={<ProtectedRoute roles={['Admin']}><Appointments /></ProtectedRoute>} />
        <Route path="admin/clinical-records" element={<ProtectedRoute roles={['Admin']}><ClinicalRecords /></ProtectedRoute>} />
        <Route path="admin/documents" element={<ProtectedRoute roles={['Admin']}><Documents /></ProtectedRoute>} />
        
        {/* Rutas de Doctor */}
        <Route path="doctor" element={<ProtectedRoute roles={['Doctor']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="doctor/dashboard" element={<ProtectedRoute roles={['Doctor']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="doctor/appointments" element={<ProtectedRoute roles={['Doctor']}><DoctorAppointments /></ProtectedRoute>} />
        <Route path="doctor/patients" element={<ProtectedRoute roles={['Doctor']}><DoctorPatients /></ProtectedRoute>} />
        <Route path="doctor/availability" element={<ProtectedRoute roles={['Doctor']}><DoctorAvailability /></ProtectedRoute>} />
        <Route path="doctor/clinical-records" element={<ProtectedRoute roles={['Doctor']}><DoctorClinicalRecords /></ProtectedRoute>} />
        <Route path="doctor/documents" element={<ProtectedRoute roles={['Doctor']}><DoctorDocuments /></ProtectedRoute>} />
        
        {/* Rutas de Patient */}
        <Route path="patient" element={<ProtectedRoute roles={['Patient']}><PatientDashboard /></ProtectedRoute>} />
        <Route path="patient/dashboard" element={<ProtectedRoute roles={['Patient']}><PatientDashboard /></ProtectedRoute>} />
        <Route path="patient/appointments" element={<ProtectedRoute roles={['Patient']}><PatientAppointments /></ProtectedRoute>} />
        <Route path="patient/doctors" element={<ProtectedRoute roles={['Patient']}><PatientDoctors /></ProtectedRoute>} />
        <Route path="patient/clinical-records" element={<ProtectedRoute roles={['Patient']}><PatientClinicalRecords /></ProtectedRoute>} />
        <Route path="patient/documents" element={<ProtectedRoute roles={['Patient']}><PatientDocuments /></ProtectedRoute>} />
        <Route path="patient/book-appointment/:doctorId" element={<ProtectedRoute roles={['Patient']}><BookAppointment /></ProtectedRoute>} />
      </Route>
      
      {/* Ruta 404 */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;