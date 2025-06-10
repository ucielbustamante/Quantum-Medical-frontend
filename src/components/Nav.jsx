import React, { useState, useEffect } from 'react'; 
import { Link } from "react-router-dom";
import styles from '../styles/nav.module.css'; 
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/logout';

export function Nav({ links = [] }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  // Usamos useEffect para leer el nombre del localStorage
  useEffect(() => {
    const storedFirstName = localStorage.getItem('userName');
    const storedLastName = localStorage.getItem('userLastName');
    if (storedFirstName && storedLastName) {
      setUserName(`${storedFirstName} ${storedLastName}`);
    } else if (storedFirstName) { 
      setUserName(storedFirstName);
    }
  }
  , []);

  const handleLogout = () => {
    logout(navigate);
    setUserName(''); 
    localStorage.removeItem('userName');
    localStorage.removeItem('userLastName');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.welcomeSection}>
        <span className={styles.welcomeMessage}>Bienvenido{userName ? `, ${userName}` : ''}</span>
      </div>

      <ul className={styles.navList}>
        {links.map((link, index) => (
          <li key={index} className={styles.navItem}>
            {link.to ? (
              <Link to={link.to} className={styles.navLink}>
                {link.label}
              </Link>
            ) : (
              <span className={styles.navLink}>{link.label}</span>
            )}
          </li>
        ))}

        <li className={styles.navItem}>
          <button onClick={handleLogout} className={styles.submitButton}>
            Cerrar sesión
          </button>
        </li>
      </ul>
    </nav>
  );
}
