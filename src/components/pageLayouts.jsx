import { Nav } from './Nav'
import styles from '../styles/PageLayout.module.css'

export function PageLayout({ children, links, onLogout }) {
  return (
    <div className={styles.container}>
      <Nav links={links} onLogout={onLogout} />
      <div className={styles.content}>{children}</div>
    </div>
  )
}
