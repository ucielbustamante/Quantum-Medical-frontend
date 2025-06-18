import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { FormGenerico } from "../components/formGenerico"
import { PageAdmin } from "../components/pageAdmin"
import { apiRequest } from "../services/apiConection"

export function EditPatient() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [name, setName] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [dni, setDni] = useState("")
  const [obraSocial, setObraSocial] = useState("")
  const [nroObraSocial, setNroObra] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [patientData, setPatientData] = useState(null)
  

  useEffect(() => {
    const fetchPatientData = async () => {
      
      if (!id) return;

      try {
        //traigo todos los pacientes y luego filtro por ID comparando con el ID del paciente que se selecciono
        const token = localStorage.getItem("token")
        const result = await apiRequest("/api/patients/search", "POST", { limit: 1000 }, token)
        const paciente = result.data.find(p => p.id === id)
        
        if (!paciente) {
          setMensaje("Paciente no encontrado")
          setLoadingData(false)
          return
        }
        console.log('--paciente',paciente);
        
        setPatientData(paciente)
        setName(paciente.User?.name || paciente.name || "")
        setLastname(paciente.User?.lastname || paciente.lastname || "")
        setEmail(paciente.User?.email || paciente.email || "")
        setDni(paciente.User?.dni || paciente.dni || "")
        setObraSocial(paciente.health_insurance || "")
        setNroObra(paciente.health_insurance_number || "")
        
        if (paciente.birthday) {
        const fecha = new Date(paciente.birthday)
        const fechaFormateada = fecha.toISOString().split('T')[0]
        setFechaNacimiento(fechaFormateada)
      }

      } catch (error) {
        console.error("Error al cargar datos del paciente:", error)
        setMensaje("Error al cargar los datos del paciente")
      } finally {
        setLoadingData(false)
      }
    }

    fetchPatientData()
  }, [id])

  
  const campos = [
    { label: "Nombre", type: "text", name: "name", value: name, onChange: (e) => setName(e.target.value) },
    { label: "Apellido", type: "text", name: "lastname", value: lastname, onChange: (e) => setLastname(e.target.value) },
    { label: "Email", type: "email", name: "email", value: email, onChange: (e) => setEmail(e.target.value) },
    { label: "DNI", type: "text", name: "dni", value: dni, onChange: (e) => setDni(e.target.value) },
    { label: "ObraSocial", type: "text", name: "obraSocial", value: obraSocial, onChange: (e) => setObraSocial(e.target.value)},
    { label: "NroObrasocial", type: "text", name: "nroObra", value: nroObraSocial, onChange: (e) => setNroObra(e.target.value)},
    { label: "FechaNacimiento", type: "date", name: "fechaNacimiento", value: fechaNacimiento, onChange: (e) => setFechaNacimiento(e.target.value)}
  ]
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMensaje("")

    const token = localStorage.getItem("token")

    try {
      //actualiza la info del user
      if (patientData.User?.id) {
        await apiRequest(`/api/users/${patientData.User.id}`, "PUT", {
          name,
          lastname,
          email,
          dni
        }, token)
      }
      //actualiza info de paciente
      await apiRequest(`/api/patients/${id}`, "PUT", {
        health_insurance: obraSocial,
        health_insurance_number: nroObraSocial,
        birthday: fechaNacimiento
      }, token)


      setMensaje("Paciente actualizado exitosamente")
      setTimeout(() => {
        navigate("/admin/all-patients")
      }, 2000)
    } catch (error) {
      console.error("Error al actualizar paciente:", error)
      setMensaje(error.message || "Error al actualizar paciente")
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingData) {
    return (
      <PageAdmin>
        <div className="container mt-4">
          <p>Cargando datos del paciente...</p>
        </div>
      </PageAdmin>
    )
  }

  if (!patientData) {
    return (
      <PageAdmin>
        <div className="container mt-4">
          <p>No se pudieron cargar los datos del paciente.</p>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/admin/all-patients")}
          >
            Volver
          </button>
        </div>
      </PageAdmin>
    )
  }
  
  return (
    <PageAdmin>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Editar Paciente</h2>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/admin/all-patients")}
          >
            Volver
          </button>
        </div>
        <FormGenerico
          titulo={`Editando: ${name} ${lastname}`}
          campos={campos}
          onSubmit={handleSubmit}
          disabled={false}
          botonTexto="Actualizar Paciente"
        />

        {isLoading && <p className="mt-3">Actualizando paciente, por favor espere...</p>}
        {mensaje && (
          <div className={`alert mt-3 ${mensaje.includes('exitosamente') ? 'alert-success' : 'alert-danger'}`}>
            {mensaje}
          </div>
        )}
      </div>
    </PageAdmin>
  )
}
