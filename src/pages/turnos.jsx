import { Card } from "../components/card"
import styles from '../styles/turnos.module.css'
import { PageAdmin } from "../components/pageAdmin"

export function Turnos() {
  const turnosEjemplo = [
    {
      paciente: "Juan Pérez",
      especialidad: "Cardiología",
      fecha: "24/05/2025",
      hora: "10:30 AM",
      medico: "Dr. Gómez",
    },
    {
      paciente: "Ana López",
      especialidad: "Dermatología",
      fecha: "25/05/2025",
      hora: "14:00 PM",
      medico: "Dra. Suárez",
    },
  ]

  return (
    <PageAdmin>
      <h1 className={styles.title}>Turnos</h1>

      <div className={styles.container}>
        <div className={styles.gridContainer}>
          {turnosEjemplo.map((turno, index) => (
            <Card
              key={index}
              title={`Paciente: ${turno.paciente}`}
              subtitle={`Especialidad: ${turno.especialidad}`}
              content={[
                `Fecha: ${turno.fecha}`,
                `Hora: ${turno.hora}`
              ]}
              link={{
                href: "#",
                text: `Médico: ${turno.medico}`
              }}
            />
          ))}
        </div>
      </div>
    </PageAdmin>
  )
}
