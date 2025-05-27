import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Form } from './components/form';
import { PageLayout } from './components/pageLayouts';
import { PageAdmin } from './components/pageAdmin';
import { Turnos } from './pages/turnos';
import { Medicos } from './pages/medicos';
import { Especialidad } from './components/especialidad';
import { NuevoMedico } from './pages/newMedic';
import { SacarTurno } from './pages/newAppointment';
import { MisTurnos } from './pages/appointmentPatient';
import { PagePatients } from './components/pagePatients';
function App() {
  return (
  <BrowserRouter>
      <Routes>
        {/* pagina gral para todos */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Form />} />
       
       {/* paginas de admin */}
        <Route path="/admin" element={<Navigate to="/turnos" />} />
        <Route path="/turnos" element={<Turnos />} />
        <Route path="/medicos" element={<Medicos />} />
        <Route path="/especialidad" element={<Especialidad />} />
        <Route path="/formulario-medico" element={<NuevoMedico />} />

        {/* esta ruta aun no tiene contenido */}
        <Route path='/patient/dashboard' element={<PagePatients />}/>
        {/* para que el paciente saque turno */}
        <Route path="/newAppointment" element={<SacarTurno />} />
        <Route path="/mis-turnos" element={<MisTurnos />} />
        
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
