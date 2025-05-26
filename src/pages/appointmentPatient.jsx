import { Card } from "../components/card"
import styles from '../styles/turnos.module.css'
import { PagePatients } from "../components/pagePatients"

export function MisTurnos() {
  // Simular paciente logueado
  const pacienteLogueado = "Juan Pérez"

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

  const turnosDelPaciente = turnosEjemplo.filter(
    (turno) => turno.paciente === pacienteLogueado
  )

  return (
    <PagePatients>
      <h1 className={styles.title}>Mis Turnos</h1>

      <div className={styles.container}>
        {turnosDelPaciente.length > 0 ? (
          <div className={styles.gridContainer}>
            {turnosDelPaciente.map((turno, index) => (
              <Card
                key={index}
                title={`Especialidad: ${turno.especialidad}`}
                subtitle={`Médico: ${turno.medico}`}
                content={[
                  `Fecha: ${turno.fecha}`,
                  `Hora: ${turno.hora}`
                ]}
              />
            ))}
          </div>
        ) : (
          <p>No tenés turnos cargados.</p>
        )}
      </div>
    </PagePatients>
  )
}
