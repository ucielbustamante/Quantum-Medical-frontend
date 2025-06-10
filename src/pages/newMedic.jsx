import { useState, useEffect } from "react"
import { FormGenerico } from "../components/formGenerico"
import { PageAdmin } from "../components/pageAdmin"
import { apiRequest } from "../services/apiConection"

export function NuevoMedico() {
  const [name, setName] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [dni, setDni] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await apiRequest("/api/specialties", "GET", null, token)
        
        setEspecialidadesDisponibles(response.data || [])
      } catch (err) {
        console.error("Error al cargar especialidades", err)
      }
    }

    fetchEspecialidades()
  }, [])

  const campos = [
    { label: "Nombre", type: "text", name: "name", value: name, onChange: (e) => setName(e.target.value) },
    { label: "Apellido", type: "text", name: "lastname", value: lastname, onChange: (e) => setLastname(e.target.value) },
    { label: "Email", type: "email", name: "email", value: email, onChange: (e) => setEmail(e.target.value) },
    { label: "Contraseña", type: "password", name: "password", value: password, onChange: (e) => setPassword(e.target.value) },
    { label: "DNI", type: "text", name: "dni", value: dni, onChange: (e) => setDni(e.target.value) },
    { label: "Matrícula", type: "text", name: "license_number", value: licenseNumber, onChange: (e) => setLicenseNumber(e.target.value) },
    {
      label: "Especialidad",
      type: "select",
      name: "specialty",
      value: specialty,
      onChange: (e) => setSpecialty(e.target.value),
      opciones: especialidadesDisponibles.map((esp) => esp.name)
    }
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
        role: "Doctor"
      }, token)

      const createdUser = userResponse.data.user
      console.log("Usuario creado:", createdUser)

      const doctorSearchResponse = await apiRequest("/api/doctors/search", "POST", {
        name: createdUser.name,
        lastname: createdUser.lastname,
        email: createdUser.email,
        limit: 1
      }, token)

      if (!doctorSearchResponse.data || doctorSearchResponse.data.length === 0) {
        throw new Error("No se pudo encontrar el doctor creado")
      }

      const doctorData = doctorSearchResponse.data[0]
      console.log("Doctor encontrado:", doctorData)

      await apiRequest(`/api/doctors/${doctorData.id}`, "PUT", {
        license_number: licenseNumber
      }, token)

      if (specialty) {
        const especialidadSeleccionada = especialidadesDisponibles.find(esp => esp.name === specialty)
        
        if (especialidadSeleccionada) {
          await apiRequest("/api/doctor-specialties", "POST", {
            doctor_id: doctorData.id,
            specialty_id: especialidadSeleccionada.id
          }, token)
        } else {
          console.warn("No se encontró la especialidad seleccionada")
        }
      }

      setMensaje("Doctor creado exitosamente con todos sus datos")
      setName("")
      setLastname("")
      setEmail("")
      setPassword("")
      setDni("")
      setLicenseNumber("")
      setSpecialty("")

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
          titulo="Agregar Nuevo Médico"
          campos={campos}
          onSubmit={handleSubmit}
          disabled={isLoading}
        />
        {isLoading && <p className="mt-3">Creando doctor, por favor espere...</p>}
        {mensaje && <p className="mt-3">{mensaje}</p>}
      </div>
    </PageAdmin>
  )
}