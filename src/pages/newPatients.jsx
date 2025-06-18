import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FormGenerico } from "../components/formGenerico"
import { PageAdmin } from "../components/pageAdmin"
import { apiRequest } from "../services/apiConection"

export function NewPatient() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [dni, setDni] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [obraSocial, setObraSocial] = useState("")
  const [nroObra, setNroObra] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [isLoading, setIsLoading] = useState(false)


  const campos = [
    { label: "Nombre", type: "text", name: "name", value: name, onChange: (e) => setName(e.target.value) },
    { label: "Apellido", type: "text", name: "lastname", value: lastname, onChange: (e) => setLastname(e.target.value) },
    { label: "Email", type: "email", name: "email", value: email, onChange: (e) => setEmail(e.target.value) },
    { label: "Contraseña", type: "password", name: "password", value: password, onChange: (e) => setPassword(e.target.value) },
    { label: "DNI", type: "text", name: "dni", value: dni, onChange: (e) => setDni(e.target.value) },
    { label: "ObraSocial", type: "text", name: "obraSocial", value: obraSocial, onChange: (e) => setObraSocial(e.target.value)},
    { label: "NroObrasocial", type: "text", name: "nroObra", value: nroObra, onChange: (e) => setNroObra(e.target.value)},
    { label: "FechaNacimiento", type: "date", name: "fechaNacimiento", value: fechaNacimiento, onChange: (e) => setFechaNacimiento(e.target.value)}
  ]
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMensaje("")

    const token = localStorage.getItem("token")

    try {
      const userResponse = await apiRequest("/api/users", "POST", {
        name,
        lastname,
        email,
        password,
        dni,
        role: "Patient"
      }, token)

      const createdUser = userResponse.data.user
      console.log("Usuario creado:", createdUser)

      const patientSearchResponse = await apiRequest("/api/patients/search", "POST", {
        name: createdUser.name,
        lastname: createdUser.lastname,
        email: createdUser.email,
        limit: 1
      }, token)

      if (!patientSearchResponse.data || patientSearchResponse.data.length === 0) {
        throw new Error("No se pudo encontrar el paciente creado")
      }

      const pacienteData = patientSearchResponse.data[0]
      console.log("Paciente encontrado:", pacienteData)

      await apiRequest(`/api/patients/${pacienteData.id}`, "PUT", {
        health_insurance: obraSocial,
        health_insurance_number: nroObra,
        birthday: fechaNacimiento
      }, token)

      setMensaje("Paciente creado exitosamente con todos sus datos")
      setName("")
      setLastname("")
      setEmail("")
      setPassword("")
      setDni("")
      setObraSocial("")
      setNroObra("")
      setFechaNacimiento("")

      setTimeout(() => {
        navigate("/admin/all-patients")
      }, 2000)

    } catch (error) {
      console.error("Error en el proceso de creación:", error)
      setMensaje(error.message || "Error al crear doctor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageAdmin>
      <div className="container mt-4">
        <FormGenerico
          titulo="Agregar Nuevo Paciente"
          campos={campos}
          onSubmit={handleSubmit}
          disabled={isLoading}
        />
        {isLoading && <p className="mt-3">Creando paciente, por favor espere...</p>}
        {mensaje && <p className="mt-3">{mensaje}</p>}
      </div>
    </PageAdmin>
  )
}