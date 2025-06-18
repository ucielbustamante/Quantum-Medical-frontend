import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Form } from './components/form';
import { ForgotPasswordPage } from './pages/forgotPassword';
import { ResetPasswordForm } from './components/resetPasswordForm';
import { AdminRoutes } from "./routes/adminRoutes";
import { PublicRoutes } from './routes/publicRoutes';
import { DoctorsRoutes } from './routes/doctorsRoutes';
import { DashboardPatients } from './pages/dashboardPatients';
import { PatientRoutes } from './routes/patientsRoutes';

function App() {
  return (
  <BrowserRouter>
      <Routes>
        {/* pagina gral para todos */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Form />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} /> 

       {/* Rutas Admin */}
        <>{AdminRoutes()}</>
        <>{PublicRoutes()}</>
        <>{PatientRoutes()}</>
        <>{DoctorsRoutes()}</>

        {/* Rutas Doctors */}
        {/* <>{DoctorsRoutes()}</> */}

        {/* esta ruta aun no tiene contenido */}
        {/* <Route path='/patient/dashboard' element={<DashboardPatients />}/> */}
        {/* para que el paciente saque turno */}
        
        
      </Routes>
  </BrowserRouter> )
  // const [message, setMessage] = useState('');

  // useEffect(() => {
  //   fetch('http://localhost:5000/api/hello')
  //     .then(res => res.json())
  //     .then(data => setMessage(data.message))
  //     .catch(console.error);
  // }, []);

  // return (
  //   <div style={{ textAlign: 'center', marginTop: '2rem' }}>
  //     <h1>Respuesta de la API:</h1>
  //     <p>{message || 'Cargando...'}</p>
  //   </div>
  // );
}

export default App;
