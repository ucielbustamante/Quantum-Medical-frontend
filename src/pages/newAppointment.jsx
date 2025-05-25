import { useState } from "react"
import { FormGenerico } from "../components/formGenerico"
import { PagePatients } from "../components/pagePatients"

export function SacarTurno() {
  // Simular que el paciente está logueado
  const pacienteLogueado = "Juan Pérez"

  const [especialidad, setEspecialidad] = useState("")
  const [fecha, setFecha] = useState("")
  const [hora, setHora] = useState("")
  const [medico, setMedico] = useState("")

  const especialidadesDisponibles = [
    "Cardiología", "Pediatría", "Dermatología", "Ginecología", "Neurología"
  ]

  const medicosDisponibles = [
    "Dr. Gómez", "Dra. Suárez", "Dr. Martínez", "Dra. Rivas"
  ]

  const campos = [
    {
      label: "Especialidad",
      name: "especialidad",
      value: especialidad,
      onChange: (e) => setEspecialidad(e.target.value),
      opciones: especialidadesDisponibles
    },
    {
      label: "Fecha",
      type: "date",
      name: "fecha",
      value: fecha,
      onChange: (e) => setFecha(e.target.value)
    },
    {
      label: "Hora",
      type: "time",
      name: "hora",
      value: hora,
      onChange: (e) => setHora(e.target.value)
    },
    {
      label: "Médico",
      name: "medico",
      value: medico,
      onChange: (e) => setMedico(e.target.value),
      opciones: medicosDisponibles
    },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()

    const nuevoTurno = {
      paciente: pacienteLogueado,
      especialidad,
      fecha,
      hora,
      medico
    }

    console.log("Turno solicitado:", nuevoTurno)

  }

  return (
    <PagePatients>
      <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
        <FormGenerico
          titulo="Solicitar Turno"
          campos={campos}
          onSubmit={handleSubmit}
        />
      </div>
    </PagePatients>
  )
}
