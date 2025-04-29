import { useState, useEffect } from 'react';
import { Form } from './components/form';
function App() {
  return (
  <div className="App">
    <Form/>
  </div> )
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
