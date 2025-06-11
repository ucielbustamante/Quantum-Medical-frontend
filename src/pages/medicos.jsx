import { useEffect, useState } from "react";
import { Card } from "../components/card";
import { Link } from "react-router-dom";
import { PageAdmin } from "../components/pageAdmin";
import { apiRequest } from "../services/apiConection";

export function Medicos() {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const token = localStorage.getItem("token");
        const result = await apiRequest("/api/doctors/search", "POST", {
          limit: 100,
        }, token);

        const medicosProcesados = result.data.map((doc) => ({
          id: doc.id,
          nombre: `${doc.User.name} ${doc.User.lastname}`,
          especialidad: doc.Specialties?.[0]?.name || "Sin especialidad",
          email: `${doc.User.email}`,
          dni: `${doc.User.dni}`,
          matricula: doc.license_number || "Sin matrícula",
        }));

        setMedicos(medicosProcesados);
      } catch (err) {
        setError("Error al cargar los médicos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicos();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const medicosFiltrados = medicos.filter((medico) =>
    medico.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medico.especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medico.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageAdmin>
      <h1 className="text-center" style={{ color: "black", marginTop: "40px" }}>
        Médicos
      </h1>

      <div className="container mt-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <form className="form-inline" onSubmit={handleSearchSubmit}>
            <input
              className="form-control"
              type="search"
              placeholder="Buscar"
              aria-label="Buscar"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </form>
          <Link to="/formulario-medico">
            <button className="btn btn-secondary">Agregar Médico</button>
          </Link>
        </div>
        {loading && <p>Cargando médicos...</p>}
        {error && <p className="text-danger">{error}</p>}

        <div className="row justify-content-center g-4">
          {medicosFiltrados.map((medico) => (
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
  );
}
