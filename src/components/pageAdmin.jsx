import { PageLayout } from './pageLayouts'

const linksAdmin = [
  { label: "Inicio", to: "/dashboard-admin"},
  { label: "Usuarios", to: "/users/all-users" },
  { label: "Turnos", to: "/turnos" },
  { label: "Pacientes", to: "/admin/all-patients" },
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
