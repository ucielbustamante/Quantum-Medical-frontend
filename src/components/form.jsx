import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {GoogleLoginButton} from './buttonGoogleLogin';
import { apiRequest } from '../services/apiConection';
import styles from '../styles/form.module.css';

export function Form() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Por favor, completa el correo y la contraseña.');
      setLoading(false);
      return;
    }

    try {
    const data = await apiRequest('/api/auth/login', 'POST', { email, password });

    console.log('Formulario enviado:', { email, password });

    console.log('data',data);
    
    localStorage.setItem('token', data.data.accessToken);
    localStorage.setItem('rol', data.data.role);
    localStorage.setItem('userName', data.data.name);
    localStorage.setItem('userLastName', data.data.lastname);

    console.log('Login y perfil exitoso. Nombre:', data.data.name, 'Apellido:', data.data.lastname);

    if (data.data.role === 'Admin') {
      navigate('/dashboard-admin');
    } else if (data.data.role === 'Patient'){
      navigate('/patient/dashboard');
    } else if (data.data.role === 'Doctor') {
      navigate('/dashboard-doctors')
    }
    
  } catch (err) {
    console.error('Error de red:', err);
    setError(err.message || 'Error al conectar con el servidor.');
  }
 finally {
      setLoading(false);
    }

  };

   
  const handleForgotPassword = () => {
    navigate('/forgot-password'); 
  };

  return (
    <div className={styles.container}> {/* Usa styles.container para aplicar los estilos */}

      <div className={styles.cardContainer}>
        <div className={`bi bi-arrow-left ${styles.arrowLeft}`}></div>
        <div className={styles.imageContainer}>
          <div className={styles.roundedImage}>
            <img
              src="/quantum.jpg"
              alt="Quantum Medical"
              className={styles.profileImage}
              style={{ objectFit: "cover" }} // Este estilo se podría mover también, pero lo dejo como ejemplo
            />
          </div>
        </div>
        <h3 className={styles.title}>Iniciar sesión</h3>
        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <div className={styles.inputGroup}>
              <input
                type="text"
                className={`form-control ${styles.inputField}`} // Acá se combina Bootstrap y el css
                placeholder="Correo Electronico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                type="password"
                className={`form-control ${styles.passwordInput}`}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className={styles.buttonGroup}>
              <button
                className={styles.submitButton}
                type="submit"
              >
                Ingresar
              </button>
            </div>
          </form>
          <div className={styles.buttonGroup}>
            <button
              className={styles.submitButton}
              type="button" 
              onClick={handleForgotPassword} 
            >
              Olvidé mi contraseña
            </button>
          </div>
          <div className={styles.buttonGroup}>
            <GoogleLoginButton />
          </div>
        </div>
      </div>
    </div>
  );
}
