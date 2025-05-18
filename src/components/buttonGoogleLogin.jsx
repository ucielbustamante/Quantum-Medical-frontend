// src/components/GoogleLoginButton.jsx
export function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <button 
      onClick={handleGoogleLogin}
      className="d-grid gap-3 d-md-flex justify-content-md-center"
      style={{
       padding: '10px 20px',
        backgroundColor: '#075269',
        color: 'white',
        border: '1px solid #075269',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: 'auto'
      }}
    >
      <img 
        src="https://www.google.com/favicon.ico" 
        alt="Google" 
        style={{ width: '20px', height: '20px' }}
      />
      Iniciar sesión con Google
    </button>
  );
}
