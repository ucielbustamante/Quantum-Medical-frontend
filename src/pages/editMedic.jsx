import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { FormGenerico } from "../components/formGenerico"
import { PageAdmin } from "../components/pageAdmin"
import { apiRequest } from "../services/apiConection"

export function EditarMedico() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [name, setName] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [dni, setDni] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [specialtiesSeleccionadas, setSpecialtiesSeleccionadas] = useState([])
  const [mensaje, setMensaje] = useState("")
  const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [doctorData, setDoctorData] = useState(null)
  const [specialtiesActuales, setspecialtiesActuales] = useState([])

  useEffect(() => {
    //aca traigo las especialidades totales para mostrar en la edicion
    const fetchEspecialidades = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await apiRequest("/api/specialties", "GET", null, token)
        setEspecialidadesDisponibles(response.data || [])
      } catch (err) {
        console.error("Error al cargar especialidades", err)
        setMensaje("Error al cargar especialidades")
      }
    }

    fetchEspecialidades()
  }, [])

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!id || especialidadesDisponibles.length === 0) return;

      try {
        //traigo todos los doctores y luego filtro por ID comparando con el ID del doc que se selecciono
        const token = localStorage.getItem("token")
        const result = await apiRequest("/api/doctors/search", "POST", { limit: 1000 }, token)
        const doctor = result.data.find(doc => doc.id === id)
        
        if (!doctor) {
          setMensaje("Médico no encontrado")
          setLoadingData(false)
          return
        }

        //aca trae trae las especialidades de todos los medicos desde el back
        const specialtiesResponse = await apiRequest("/api/doctor-specialties", "GET", null, token)
        const allDoctorSpecialties = specialtiesResponse.data
        
        //se filtran los medicos por ID para solo quedarse con el que coincida con el med actual
        const specialtiesDelMedico = allDoctorSpecialties
          .filter(ds => ds.doctor_id === id ) 
        
        let doctorSpecialties = []
        for(const idEspMed of specialtiesDelMedico){
          const findSpecialties = especialidadesDisponibles.find(e =>  e.id === idEspMed.specialty_id)
          if(findSpecialties){
            doctorSpecialties.push(findSpecialties)
          }
        }
        
        setDoctorData(doctor)
        setName(doctor.User?.name || doctor.name || "")
        setLastname(doctor.User?.lastname || doctor.lastname || "")
        setEmail(doctor.User?.email || doctor.email || "")
        setDni(doctor.User?.dni || doctor.dni || "")
        setLicenseNumber(doctor.license_number || "")
        setspecialtiesActuales(doctorSpecialties)
        setSpecialtiesSeleccionadas(doctorSpecialties.map(e => e.id))

      } catch (error) {
        console.error("Error al cargar datos del médico:", error)
        setMensaje("Error al cargar los datos del médico")
      } finally {
        setLoadingData(false)
      }
    }

    fetchDoctorData()
  }, [id, especialidadesDisponibles])

  //para manejar cuando se cambian las especialidades
  const handleChangeEspecialidades = (e) => {
    const seleccionadas = Array.from(e.target.selectedOptions, option => option.value)
    setSpecialtiesSeleccionadas(seleccionadas)
  }
  
  const campos = [
    { label: "Nombre", type: "text", name: "name", value: name, onChange: (e) => setName(e.target.value) },
    { label: "Apellido", type: "text", name: "lastname", value: lastname, onChange: (e) => setLastname(e.target.value) },
    { label: "Email", type: "email", name: "email", value: email, onChange: (e) => setEmail(e.target.value) },
    { label: "DNI", type: "text", name: "dni", value: dni, onChange: (e) => setDni(e.target.value) },
    { label: "Matrícula", type: "text", name: "licenseNumber", value: licenseNumber, onChange: (e) => setLicenseNumber(e.target.value) },
    {
      label: "Especialidades",
      type: "select",
      name: "specialties",
      value: specialtiesSeleccionadas,
      onChange: handleChangeEspecialidades,
      opciones: especialidadesDisponibles.map(esp => ({
        value: esp.id,
        label: esp.name
      })),
      multiple: true
    }
  ]
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMensaje("")

    const token = localStorage.getItem("token")

    try {
      //actualiza la info del user
      if (doctorData.User?.id) {
        await apiRequest(`/api/users/${doctorData.User.id}`, "PUT", {
          name,
          lastname,
          email,
          dni
        }, token)
      }
      //actualiza info de doctors
      await apiRequest(`/api/doctors/${id}`, "PUT", {
        license_number: licenseNumber
      }, token)

      //trae info de doctor-specialties y luego filtra para quedarse con las que corresponda con el ID del doc
      const responseEspecialidadesActuales = await apiRequest("/api/doctor-specialties", "GET", null, token)
      const especialidadesActuales = responseEspecialidadesActuales.data
        .filter(ds => ds.doctor_id === id)
        .map(ds => ds.specialty_id)

      //para comprobar si se tiene que eliminar una especialidad y/o agregar una nueva
      const especialidadesAEliminar = especialidadesActuales.filter(id => !specialtiesSeleccionadas.includes(id))
      const especialidadesANuevas = specialtiesSeleccionadas.filter(id => !especialidadesActuales.includes(id))

      //se elimina especialidad actual del medico que no queda seleccionada
      for (const espName of especialidadesAEliminar) {
          try {
            await apiRequest(`/api/doctor-specialties/${id}/${espName}`, "DELETE", null, token)
          } catch (err) {
            console.warn("Error al eliminar especialidad:", espName, err)
          }
      }
      //se agrega nueva especialidad seleccionada
      for (const espName of especialidadesANuevas) {
          await apiRequest("/api/doctor-specialties", "POST", {
            doctor_id: id,
            specialty_id: espName
          }, token)
        
      }

      setMensaje("Médico actualizado exitosamente")
      setTimeout(() => {
        navigate("/medicos")
      }, 2000)
    } catch (error) {
      console.error("Error al actualizar médico:", error)
      setMensaje(error.message || "Error al actualizar médico")
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingData) {
    return (
      <PageAdmin>
        <div className="container mt-4">
          <p>Cargando datos del médico...</p>
        </div>
      </PageAdmin>
    )
  }

  if (!doctorData) {
    return (
      <PageAdmin>
        <div className="container mt-4">
          <p>No se pudieron cargar los datos del médico.</p>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/medicos")}
          >
            Volver
          </button>
        </div>
      </PageAdmin>
    )
  }
  const espMed = doctorData.Specialties?.length
      ? doctorData.Specialties.map((s) => s.name).join(", ")
      : "Sin especialidad"
  return (
    <PageAdmin>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Editar Médico</h2>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/medicos")}
          >
            Volver
          </button>
        </div>
        <p>Especialidades Actuales: {espMed}</p>
        <FormGenerico
          titulo={`Editando: ${name} ${lastname}`}
          campos={campos}
          onSubmit={handleSubmit}
          disabled={false}
          botonTexto="Actualizar Médico"
        />

        {isLoading && <p className="mt-3">Actualizando médico, por favor espere...</p>}
        {mensaje && (
          <div className={`alert mt-3 ${mensaje.includes('exitosamente') ? 'alert-success' : 'alert-danger'}`}>
            {mensaje}
          </div>
        )}
      </div>
    </PageAdmin>
  )
}
