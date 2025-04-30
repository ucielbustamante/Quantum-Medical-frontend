import React, { useEffect } from 'react';

const AuthSuccess = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  useEffect(() => {
    if (token) {
      localStorage.setItem('accessToken', token);
      setTimeout(() => {
        window.location.href = '/';
      }, 10000);
    }
  }, [token]);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>¡Autenticación exitosa!</h1>
      <p>Te redirigimos al inicio...</p>
    </div>
  );
};

export default AuthSuccess;
