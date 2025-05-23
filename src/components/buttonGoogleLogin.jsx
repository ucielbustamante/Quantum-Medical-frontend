// src/components/GoogleLoginButton.jsx
import styles from '../styles/buttonGoogleLogin.module.css';

export function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <button 
      onClick={handleGoogleLogin}
      className={`d-grid gap-3 d-md-flex justify-content-md-center ${styles.googleButton}`}
    >
      <img 
        src="https://www.google.com/favicon.ico" 
        alt="Google" 
        style={{ width: '20px', height: '20px', userSelect: 'none', pointerEvents: 'none' }}
      />
      Iniciar sesión con Google
    </button>
  );
}
