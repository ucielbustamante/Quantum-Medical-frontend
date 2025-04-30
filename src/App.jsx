import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthSuccess from './components/AuthSuccess';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(console.error);
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const Home = () => (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Respuesta de la API:</h1>
      <p>{message || 'Cargando...'}</p>
      <button 
        onClick={handleGoogleLogin}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          margin: '20px auto',
          gap: '10px'
        }}
      >
        <img 
          src="https://www.google.com/favicon.ico" 
          alt="Google" 
          style={{ width: '20px', height: '20px' }}
        />
        Iniciar sesión con Google
      </button>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;