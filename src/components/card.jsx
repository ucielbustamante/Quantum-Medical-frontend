import { Link } from "react-router-dom";
import styles from '../styles/card.module.css'

export function Card({ title, subtitle, content = [], links = [] }) {
  return (
    <div className={`position-relative  ${styles.card}`}>
      {title && <h5 className={styles.cardTitle}>{title}</h5>}
      {subtitle && <h6 className={styles.cardSubtitle}>{subtitle}</h6>}
      
      {content.map((linea, index) => (
        typeof linea === "string"
          ? <p key={index}>{linea}</p>
          : <div key={index} className="mt-2">{linea}</div>
      ))}


      {links.length > 0 && (
        <div className={styles.cardLinks}>
          {links.map((link, index) => (
            <Link key={index} to={link.href} className={styles.cardLink}>
              {link.text}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
