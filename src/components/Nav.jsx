import { Link } from "react-router-dom"
import styles from '../styles/nav.module.css'
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/logout';

export function Nav({ links = [] }) {
  const navigate = useNavigate();

  const handleLogout = () => logout(navigate);

  return (
    <nav className={styles.navbar}>
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
  )
}
