import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import { apiRequest } from '../services/apiConection'; 
import styles from '../styles/form.module.css'; 

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); 
  const [token, setToken] = useState(''); 

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(''); 
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);

  // useEffect para extraer el token de la URL 
  useEffect(() => {
    const urlToken = searchParams.get('token'); // Asume que el token viene en la URL como "?token=AAA"
    if (urlToken) {
      setToken(urlToken);
    } else {
      setError('Token de restablecimiento de contraseña no encontrado en la URL.');
    }
  }, [searchParams]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); 
    setError('');
    setLoading(true);

    if (!token) {
      setError('No se ha proporcionado un token válido para restablecer la contraseña.');
      setLoading(false);
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Por favor, ingresa y confirma tu nueva contraseña.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) { // Ejemplo: mínimo 6 caracteres
        setError('La contraseña debe tener al menos 6 caracteres.');
        setLoading(false);
        return;
    }

    try {
      const response = await apiRequest('/api/auth/reset-password/confirm', 'POST', { 
        token: token, 
        newPassword: newPassword 
      });

      if (response.statusCode === 200) {
        setMessage(response.data.message || 'Contraseña actualizada exitosamente. ¡Ahora puedes iniciar sesión!');
        setNewPassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
          navigate('/'); 
        }, 3000);
        
      } else {
        setError('Ocurrió un problema inesperado al actualizar la contraseña.');
      }
      
    } catch (err) {
      console.error('Error al confirmar restablecimiento de contraseña:', err);
      let errorMessage = 'Error al actualizar la contraseña. Inténtalo de nuevo.';
      if (err.message) {
          errorMessage = err.message; 
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBackToLogin = () => {
    navigate('/'); 
  };

  return (
    <div className={styles.container}>
      <div className={styles.cardContainer}>
        <div className={`bi bi-arrow-left ${styles.arrowLeft}`} onClick={handleGoBackToLogin}></div>
        <div className={styles.imageContainer}>
          <div className={styles.roundedImage}>
            <img
              src="/quantum.jpg" 
              alt="Quantum Medical"
              className={styles.profileImage}
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
        <h3 className={styles.title}>Establecer Nueva Contraseña</h3>
        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            {message && <div className={styles.successMessage}>{message}</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            <div className={styles.inputGroup}>
              <input
                type="password"
                className={`form-control ${styles.inputField}`}
                placeholder="Nueva Contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                type="password"
                className={`form-control ${styles.inputField}`}
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.buttonGroup}>
              <button
                className={styles.submitButton}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Cambiando...' : 'Restablecer Contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
