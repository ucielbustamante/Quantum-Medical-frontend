import { Card } from "../components/card"
import { Link } from "react-router-dom"
import { PageAdmin } from "../components/pageAdmin"

export function AllUsers() {
  const usuariosEjemplo = [
    {
      nombre: "Ana Torres",
      email: "ana.torres@example.com",
      rol: "Admin",
    },
    {
      nombre: "Carlos López",
      email: "carlos.lopez@example.com",
      rol: "Doctor",
    },
    {
      nombre: "Valeria Díaz",
      email: "valeria.diaz@example.com",
      rol: "Patient",
    },
  ]

  return (
    <PageAdmin>
      <h1 className="text-center" style={{ color: "black", marginTop: "40px" }}>
        Usuarios
      </h1>

      <div className="d-flex justify-content-end me-4 mb-3">
        <Link to="/users">
          <button className="btn btn-secondary">Agregar Usuario</button>
        </Link>
      </div>

      {/* <div className="d-flex justify-content-end me-4 mb-3">
        <Link to="/">
          <button className="btn btn-secondary">Buscar Usuario</button>
        </Link>
      </div> */}

      <div className="container mt-4">
        <div className="row justify-content-center g-4">
          {usuariosEjemplo.map((usuario, index) => (
            <div className="col-md-3" key={index}>
              <Card
                title={usuario.nombre}
                subtitle={`Rol: ${usuario.rol}`}
                content={[`Email: ${usuario.email}`]}
                link={{ href: "#", text: "Editar" }}
              />
            </div>
          ))}
        </div>
      </div>
    </PageAdmin>
  )
}
