import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Form } from './components/form';
import { PageAdmin } from './components/pageAdmin';
import { Turnos } from './components/turnos';
import { Medicos } from './components/medicos';
function App() {
  return (
  <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Form />} />
        <Route path="/admin" element={<PageAdmin />}/>
        <Route path='/turnos' element={<Turnos />} />
        <Route path='/medicos' element={<Medicos />} />
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
