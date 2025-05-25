import { useState } from "react"
import { FormGenerico } from "../components/formGenerico"
import { PageAdmin } from "../components/pageAdmin"

export function NuevoMedico() {
    const [nombre, setNombre] = useState("")
    const [apellido, setApellido] = useState("")
    const [especialidad, setEspecialidad] = useState("")
    const [matricula, setMatricula] = useState("")

    // cuando se conecte al back cambiar por especialidades cargadas
    const especialidadesDisponibles = [
        "Cardiología",
        "Pediatría",
        "Dermatología",
        "Ginecología",
        "Neurología"
    ]

    const campos = [
        {
            label: "Nombre",
            type: "text",
            name: "nombre",
            value: nombre,
            onChange: (e) => setNombre(e.target.value)
        },
        {
            label: "Apellido",
            type: "text",
            name: "apellido",
            value: apellido,
            onChange: (e) => setApellido(e.target.value)
        },
        {
            label: "Especialidad",
            name: "especialidad",
            value: especialidad,
            onChange: (e) => setEspecialidad(e.target.value),
            opciones: especialidadesDisponibles
        },
        {
            label: "Matrícula",
            type: "number",
            name: "matricula",
            value: matricula,
            onChange: (e) => setMatricula(e.target.value)
        }
    ]

    const handleSubmit = (e) => {
        e.preventDefault()

        const nuevoMedico = {
            nombre,
            apellido,
            especialidad,
            matricula
        }

        console.log("Nuevo médico cargado:", nuevoMedico)

        // Reset
        setNombre("")
        setApellido("")
        setEspecialidad("")
        setMatricula("")
    }

    return (
        <PageAdmin>
            <div className="container mt-4">
                <FormGenerico
                    titulo="Agregar Nuevo Médico"
                    campos={campos}
                    onSubmit={handleSubmit}
                />
            </div>
        </PageAdmin>
    )
}
