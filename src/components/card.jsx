import styles from '../styles/card.module.css'

export function Card({ title, subtitle, content = [], link }) {
  return (
    <div className={`position-relative  ${styles.card}`}>
      {title && <h5 className={styles.cardTitle}>{title}</h5>}
      {subtitle && <h6 className={styles.cardSubtitle}>{subtitle}</h6>}
      
      {content.map((linea, index) => (
        typeof linea === "string"
          ? <p key={index}>{linea}</p>
          : <div key={index} className="mt-2">{linea}</div>
      ))}


      {link && (
        <a href={link.href} className={styles.cardLink}>
          {link.text}
        </a>
      )}
    </div>
  )
}
