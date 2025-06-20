import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp > currentTime) {
          setUser({
            id: payload.id,
            name: payload.firstName || payload.name,
            lastname: payload.lastName || payload.lastname,
            email: payload.email,
            role: payload.role,
          });
        } else {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      }
    }
    setLoading(false);
  }, []);

  const login = async (data) => {
    try {
      const response = await api.post('/api/auth/login', data);
      
      const { accessToken, ...userData } = response.data.data;
      
      localStorage.setItem('token', accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      setUser(userData);
      toast.success(`Bienvenido, ${userData.name}!`);
      
      // Redirigir según el rol
      switch (userData.role) {
        case 'Admin':
          navigate('/admin/dashboard');
          break;
        case 'Doctor':
          navigate('/doctor/dashboard');
          break;
        case 'Patient':
          navigate('/patient/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response) {
        const { status, data } = error.response;
        const backendMessage = data?.data?.message || data?.message;
        
        switch (status) {
          case 401:
            if (backendMessage) {
              errorMessage = backendMessage;
            } else {
              errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
            }
            break;
          case 404:
            errorMessage = 'Usuario no encontrado. Verifica tu email.';
            break;
          case 422:
            errorMessage = backendMessage || 'Datos de entrada inválidos.';
            break;
          case 500:
            errorMessage = 'Error del servidor. Intenta nuevamente más tarde.';
            break;
          default:
            errorMessage = backendMessage || 'Error al iniciar sesión. Intenta nuevamente.';
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else {
        errorMessage = error.message || 'Error inesperado al iniciar sesión.';
      }
      
      toast.error(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const loginWithToken = async (token) => {
    try {
      // Decodificar el token JWT para obtener la información del usuario
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Verificar que el token no haya expirado
      const currentTime = Date.now() / 1000;
      if (payload.exp <= currentTime) {
        throw new Error('Token expirado');
      }
      
      // Establecer el token en localStorage y headers
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Crear objeto de usuario desde el payload del token
      const userData = {
        id: payload.id,
        name: payload.firstName || payload.name,
        lastname: payload.lastName || payload.lastname,
        email: payload.email,
        role: payload.role,
      };
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Error processing token:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      return { 
        success: false, 
        error: error.message || 'Error al procesar el token' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      const { token, user: newUser } = response.data.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(newUser);
      toast.success('Registro exitoso!');
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error en el registro' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
    toast.success('Sesión cerrada exitosamente');
  };

  const value = {
    user,
    login,
    loginWithToken,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    hasAnyRole: (roles) => {
      if (!user || !roles || roles.length === 0) return false;
      return roles.includes(user.role);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 