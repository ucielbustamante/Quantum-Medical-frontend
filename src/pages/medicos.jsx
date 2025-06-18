import { useEffect, useState } from "react";
import { Card } from "../components/card";
import { Link } from "react-router-dom";
import { PageAdmin } from "../components/pageAdmin";
import { apiRequest } from "../services/apiConection";
import { HorariosDisponibles } from "../components/HorariosDisponible";

export function Medicos() {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [limite] = useState(8);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingDoctorId, setDeletingDoctorId] = useState(null);

  useEffect(() => {
    const fetchMedicos = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        const isSearching = searchTerm.trim().length > 0;
        const offset = isSearching ? 0 : (paginaActual - 1) * limite;
        const limitToUse = isSearching ? 1000 : limite;
        /* trae todos los medicos que hay */
        const result = await apiRequest("/api/doctors/search", "POST", {
          limit: limitToUse,
          offset
        }, token);
        
        const medicosBrutos = result.data;
        /* se arman los datos de cada medico  */
        
        const disponibilidadResult = await apiRequest("/api/availability", "GET", null, token);
        const todasLasDisponibilidades = disponibilidadResult?.data || [];
        const mapaDisponibilidad = new Map();
        todasLasDisponibilidades.forEach(item => {
        const doctorId = item.Doctor?.id;
        if (!doctorId) return;

        if (!mapaDisponibilidad.has(doctorId)) {
          mapaDisponibilidad.set(doctorId, []);
        }

        mapaDisponibilidad.get(doctorId).push({
          weekday: item.weekday,
          start_time: item.start_time,
          end_time: item.end_time,
          slot_duration_min: item.slot_duration_min
        });
      });

      const medicosConDisponibilidad = medicosBrutos.map(doc => {
        const doctorId = doc.id;
        return {
          id: doctorId,
          nombre: `${doc.User.name} ${doc.User.lastname}`,
          especialidad: doc.Specialties?.length
            ? doc.Specialties.map((s) => s.name).join(", ")
            : "Sin especialidad",
          email: doc.User.email,
          dni: doc.User.dni,
          matricula: doc.license_number || "Sin matrícula",
          disponibilidad: mapaDisponibilidad.get(doctorId) || []
        };
      });

      setMedicos(medicosConDisponibilidad);


      } catch (err) {
        setError("Error al cargar los médicos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicos();
  }, [paginaActual, searchTerm]);

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este médico? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      setDeletingDoctorId(doctorId);
      const token = localStorage.getItem("token");
      
      await apiRequest(`/api/doctors/${doctorId}`, "DELETE", null, token);
      
      // Actualizar la lista de médicos
      setMedicos(prevDoctors => prevDoctors.filter(doctor => doctor.id !== doctorId));
      
      alert("Médico eliminado exitosamente");
    } catch (err) {
      console.error("Error al eliminar médico:", err);
      alert("Error al eliminar el médico. Por favor intente nuevamente.");
    } finally {
      setDeletingDoctorId(null);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPaginaActual(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };
  /* filtrado de medicos incluyendo nombre,especialidad, email, dni, matricula, permitiendo 
    que se use mayuscula o minuscula por igual*/
  const medicosFiltrados = medicos.filter((medico) =>
    medico.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medico.especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medico.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medico.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medico.matricula.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <HorariosDisponibles disponibilidad={medico.disponibilidad} />
                ]}
                links={[{ href: `/admin/doctors/edit/${medico.id}`, text: "Editar" }]}
                actions={[
                  {
                    text: deletingDoctorId === medico.id ? "Eliminando..." : "Eliminar",
                    onClick: () => handleDeleteDoctor(medico.id),
                    className: "btn btn-danger btn-sm",
                    disabled: deletingDoctorId === medico.id
                  }
                ]}
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
            disabled={medicos.length < limite}
            >
            Siguiente
          </button>
        </div>
        )}

      </div>
    </PageAdmin>
  );
}
