import { PageLayout } from './pageLayouts'

const linksAdmin = [
  { label: "Inicio", to: "/dashboard-admin"},
  { label: "Turnos", to: "/turnos" },
  { label: "Médicos", to: "/medicos" },
  { label: "Especialidad", to: "/especialidad" },
]

export function PageAdmin({ children }) {
  return (
    <PageLayout links={linksAdmin} onLogout={() => console.log("cerrar sesión")}>
      {children}
    </PageLayout>
  )
}
