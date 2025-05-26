import { Link } from "react-router-dom"
import styles from '../styles/nav.module.css'

export function Nav({ links = [], onLogout }) {
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
          <button onClick={onLogout} className={styles.submitButton}>
            Cerrar sesión
          </button>
        </li>
      </ul>
    </nav>
  )
}
