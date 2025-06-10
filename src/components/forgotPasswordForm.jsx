import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/apiConection'; 
import styles from '../styles/form.module.css'; 

export function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); 
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); 
    setError('');
    setLoading(true);

    if (!email) {
      setError('Por favor, ingresa tu correo electrónico.');
      setLoading(false);
      return;
    }

    try {
      const response = await apiRequest('/api/auth/reset-password', 'POST', { email: email });

      if (response.statusCode === 200) { 
        setMessage(response.data.message || 'Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.');
        setEmail(''); 
      } else {
        setError('Ocurrió un problema inesperado al enviar el correo.');
      }
      
    } catch (err) {
      console.error('Error al solicitar restablecimiento de contraseña:', err);
      let errorMessage = 'Error al procesar tu solicitud. Inténtalo de nuevo.';
      if (err.message) {
          errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/'); 
  };

  return (
    <div className={styles.container}>
      <div className={styles.cardContainer}>
        <div className={`bi bi-arrow-left ${styles.arrowLeft}`} onClick={handleGoBack}></div>
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
        <h3 className={styles.title}>Recuperar Contraseña</h3>
        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            {message && <div className={styles.successMessage}>{message}</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            <div className={styles.inputGroup}>
              <input
                type="email"
                className={`form-control ${styles.inputField}`}
                placeholder="Correo Electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.buttonGroup}>
              <button
                className={styles.submitButton}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Restablecer Contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
