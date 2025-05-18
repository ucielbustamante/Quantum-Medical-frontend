import { useState } from 'react';
import {GoogleLoginButton} from './buttonGoogleLogin';
import styles from '../styles/form.module.css';

export function Form() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert('Por favor, completa el usuario y la contraseña.');
      return;
    }

    console.log('Formulario enviado:', { username, password });
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
            <div className={styles.inputGroup}>
              <input
                type="text"
                className={`form-control ${styles.inputField}`} // Acá se combina Bootstrap y el css
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
            <GoogleLoginButton />
          </div>
        </div>
      </div>
    </div>
  );
}