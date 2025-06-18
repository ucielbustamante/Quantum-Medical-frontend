import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Form } from './components/form';
import { ForgotPasswordPage } from './pages/forgotPassword';
import { ResetPasswordForm } from './components/resetPasswordForm';
import { AdminRoutes } from "./routes/adminRoutes";
import { PublicRoutes } from './routes/publicRoutes';
import { DoctorsRoutes } from './routes/doctorsRoutes';
import { PatientRoutes } from './routes/patientsRoutes';
import { AuthSuccess } from './components/authSuccess';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Páginas generales para todos */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Form />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} /> 

        {/* Rutas Admin */}
        <>{AdminRoutes()}</>
        
        {/* Rutas Públicas */}
        <>{PublicRoutes()}</>
        
        {/* Rutas Patient */}
        <>{PatientRoutes()}</>
        
        {/* Rutas Doctors */}
        <>{DoctorsRoutes()}</>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
