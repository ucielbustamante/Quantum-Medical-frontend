import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    
    const token = searchParams.get('token');
    
    if (token) {
      hasProcessed.current = true;
      
      loginWithToken(token)
        .then((result) => {
          if (result.success) {
            toast.success('Inicio de sesión exitoso');
            const role = result.user?.role?.toLowerCase();
            if (role) {
              navigate(`/${role}/dashboard`);
            } else {
              navigate('/dashboard');
            }
          } else {
            toast.error('Error al procesar el inicio de sesión');
            navigate('/auth/login');
          }
        })
        .catch((error) => {
          console.error('Error processing auth token:', error);
          toast.error('Error al procesar la autenticación');
          navigate('/auth/login');
        });
    } else {
      hasProcessed.current = true;
      toast.error('Token de autenticación no encontrado');
      navigate('/auth/login');
    }
  }, [searchParams, navigate, loginWithToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Autenticación Exitosa
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Procesando tu inicio de sesión...
          </p>
        </div>
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
};

export default AuthSuccess; 