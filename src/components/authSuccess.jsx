import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export function AuthSuccess() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem('authToken', token);

            try {
                const decodedToken = jwtDecode(token);

                const userName = decodedToken.firstName || decodedToken.given_name || 'Usuario';
                const userLastName = decodedToken.lastName || decodedToken.family_name || '';

                if (userName) {
                    localStorage.setItem('userName', userName);
                }
                if (userLastName) {
                    localStorage.setItem('userLastName', userLastName);
                }

                navigate('/patient/dashboard');
            } catch (error) {
                console.error('Error decodificando el token JWT:', error);
                navigate('/login');
            }

        } else {
            console.error('No se encontró el token en la URL.');
            navigate('/login');
        }
    }, [location, navigate]);

    return (
        <div>
            <p>Iniciando sesión...</p>
        </div>
    );
};

export default AuthSuccess;
