import { useState } from 'react';

export function Form() {
 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  //  para manejar el envio del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
   
    console.log('Formulario enviado:', { username, password });
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center" 
         style={{ 
           minHeight: "100vh", 
           background: "linear-gradient(180deg, #004257 0%, #006994 100%)"
         }}>
      
      
      <div className="mb-3">
        <div className="d-flex justify-content-center">
            <div className="rounded-circle overflow-hidden" style={{ width: "150px", height: "150px" }}>
            <img 
                src="/quantum.jpg" 
                alt="Quantum Medical" 
                className="w-100 h-100"
                style={{ objectFit: "cover" }}
            />
            </div>
        </div>
      </div>
      
      
      <h3 className="text-white mb-4 fs-5">Ingreso de Usuario</h3>
      
     
      <div className="card p-4" style={{ 
        maxWidth: "600px", 
        width: "90%", 
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(5px)",
        border: "none",
        borderRadius: "10px"
      }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4 p-2">
              <input 
                type="text" 
                className="form-control form-control-sm form-control-sm bg-light mb-2"
                placeholder="USUARIO"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ border: "none" }}
              />
            </div>
            
            <div className="mb-4 p-2">
              <input 
                type="password" 
                className="form-control form-control-sm form-control-sm bg-light"
                placeholder="CONTRASEÑA"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ border: "none" }}
              />
            </div>
            
            <div className="d-grid gap-3 d-md-flex justify-content-md-center">
              <button 
                className="btn btn-sm p-3"
                type="submit"
                style={{ 
                  backgroundColor: "#075269", 
                  color: "white",
                  border: "none"
                }}
              >
                INGRESAR
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}