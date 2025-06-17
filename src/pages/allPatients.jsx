import { useEffect, useState } from "react";
import { Card } from "../components/card";
import { Link } from "react-router-dom";
import { PageAdmin } from "../components/pageAdmin";
import { apiRequest } from "../services/apiConection";


export function AllPatients() {
  const [paciente, setPaciente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [limite] = useState(8);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPacientes = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        const isSearching = searchTerm.trim().length > 0;
        const offset = isSearching ? 0 : (paginaActual - 1) * limite;
        const limitToUse = isSearching ? 1000 : limite;
        /* trae todos los pacientes que hay */
        const result = await apiRequest("/api/patients/search", "POST", {
          limit: limitToUse,
          offset
        }, token);
        
        const pacientesBrutos = result.data;
        console.log('--pacientes', pacientesBrutos);
        

        const pacientesTotales = pacientesBrutos.map(paciente => {
        const pacienteId = paciente.id;
        return {
          id: pacienteId,
          nombre: `${paciente.User.name} ${paciente.User.lastname}`,
          email: paciente.User.email,
          dni: paciente.User.dni,
          fecha_nacimineto: paciente.birthday,
          obra_social: paciente.health_insurance,
          nro_obra: paciente.health_insurance_number
        };
      });

      setPaciente(pacientesTotales);


      } catch (err) {
        setError("Error al cargar los pacientes.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, [paginaActual, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPaginaActual(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };
  /* filtrado de pacientes incluyendo nombre, email, dni, permitiendo 
    que se use mayuscula o minuscula por igual*/
  const pacientesFiltrados = paciente.filter((paciente) =>
    paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.dni.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageAdmin>
      <h1 className="text-center" style={{ color: "black", marginTop: "40px" }}>
        Pacientes
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
            <button className="btn btn-secondary">Agregar Paciente</button>
          </Link>
        </div>
        {loading && <p>Cargando pacientes...</p>}
        {error && <p className="text-danger">{error}</p>}

        <div className="row justify-content-center g-4">
          {pacientesFiltrados.map((p) => (
            <div className="col-md-3" key={p.id}>
              <Card
                title={p.nombre}
                subtitle={[`DNI: ${p.nombre}`]}
                content={[
                  `Email: ${p.email}`,
                  `Fecha Nacimiento: ${p.fecha_nacimineto}`,
                  `Obra social: ${p.obra_social}`,
                  `Nro obra social: ${p.nro_obra}`
                ]}
                link={{ href: `/admin/doctors/edit/${p.id}`, text: "Editar" }}
              />

            </div>
          ))}

        </div>
        {!searchTerm && (
        <div className="d-flex justify-content-center mt-4 gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
            disabled={paginaActual === 1}
            >
            Anterior
          </button>

          <span className="align-self-center">Página {paginaActual}</span>

          <button
            className="btn btn-outline-primary"
            onClick={() => setPaginaActual(prev => prev + 1)}
            disabled={paciente.length < limite}
            >
            Siguiente
          </button>
        </div>
        )}

      </div>
    </PageAdmin>
  );
}
