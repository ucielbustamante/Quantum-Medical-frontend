import { PageLayout } from './pageLayouts'

const linksDoctors = [
  { label: "Inicio", to: "/dashboard-doctor"},
]

export function PageDoctors({ children }) {
  return (
    <PageLayout links={linksDoctors} onLogout={() => console.log("cerrar sesión")}>
      {children}
    </PageLayout>
  )
}
