import { useEffect, useState } from "react";
import { Card } from "../components/card"
import { Link } from "react-router-dom"
import { PageAdmin } from "../components/pageAdmin"
import { apiRequest } from "../services/apiConection"

export function Medicos() {
  const [medicos, setMedicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const token = localStorage.getItem("token")
        const result = await apiRequest("/api/doctors/search", "POST", {
          limit: 100
        }, token)

        const medicosProcesados = result.data.map((doc) => ({
          id: doc.id,
          nombre: `${doc.User.name} ${doc.User.lastname}`,
          especialidad: doc.Specialties?.[0]?.name || "Sin especialidad",
          email: `${doc.User.email}`,
          dni: `${doc.User.dni}`,
          matricula: doc.license_number || "Sin matrícula",
        }))

        setMedicos(medicosProcesados)
      } catch (err) {
        setError("Error al cargar los médicos.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMedicos()
  }, [])

  return (
    <PageAdmin>
      <h1 className="text-center" style={{ color: "black", marginTop: "40px" }}>
        Médicos
      </h1>

      <div className="d-flex justify-content-end me-4 mb-3">
        <Link to="/formulario-medico">
          <button className="btn btn-secondary m-1">Agregar Médico</button>
        </Link>
        <Link to="/email">
          <button className="btn btn-secondary m-1">Buscar Médico</button>
        </Link>
      </div>

      {/* <div className="d-flex justify-content-end me-4 mb-3">
        
      </div> */}

      <div className="container mt-4 mb-4">
        {loading && <p>Cargando médicos...</p>}
        {error && <p className="text-danger">{error}</p>}

        <div className="row justify-content-center g-4">
          {medicos.map((medico) => (
            <div className="col-md-3" key={medico.id}>
              <Card
                title={medico.nombre}
                subtitle={medico.especialidad}
                content={[
                  `Email: ${medico.email}`,
                  `DNI: ${medico.dni}`,
                  `Matrícula: ${medico.matricula}`,
                ]}
                link={{ href: "#", text: "Editar" }}
              />
            </div>
          ))}
        </div>
      </div>
    </PageAdmin>
  )
}
