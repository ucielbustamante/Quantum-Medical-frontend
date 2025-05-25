import { PageLayout } from './pageLayouts'

const linksPatientes = [
  { label: "Mis Turnos", to: "/mis-turnos" },
  { label: "Sacar Turno", to: "/newAppointment" },
  
]

export function PagePatients({ children }) {
  return (
    <PageLayout links={linksPatientes} onLogout={() => console.log("cerrar sesión")}>
      {children}
    </PageLayout>
  )
}
