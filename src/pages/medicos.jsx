import { Card } from "../components/card"
import { Link } from "react-router-dom"
import { PageAdmin } from "../components/pageAdmin"

export function Medicos() {
  const medicosEjemplo = [
    {
      nombre: "Dra. Laura García",
      especialidad: "Pediatría",
      matricula: "12345",
      telefono: "1122334455",
    },
    {
      nombre: "Dr. Juan Pérez",
      especialidad: "Cardiología",
      matricula: "67890",
      telefono: "1144556677",
    },
  ]

  return (
    <PageAdmin>
      <h1 className="text-center" style={{ color: "black", marginTop: "40px" }}>
        Médicos
      </h1>

      <div className="d-flex justify-content-end me-4 mb-3">
        <Link to="/formulario-medico">
          <button className="btn btn-secondary">Agregar Médico</button>
        </Link>
      </div>

      <div className="container mt-4">
        <div className="row justify-content-center g-4">
          {medicosEjemplo.map((medico, index) => (
            <div className="col-md-3" key={index}>
              <Card
                title={medico.nombre}
                subtitle={medico.especialidad}
                content={[
                  `Matrícula: ${medico.matricula}`,
                  `Teléfono: ${medico.telefono}`,
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
