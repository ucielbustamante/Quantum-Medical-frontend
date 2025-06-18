import { useEffect, useState } from "react";
import { Card } from "../components/card";
import { Link } from "react-router-dom";
import { PageAdmin } from "../components/pageAdmin";
import { apiRequest } from "../services/apiConection";

export function AllSpecialties() {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingSpecialtyId, setDeletingSpecialtyId] = useState(null);

  useEffect(() => {
    const fetchSpecialties = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        
        const result = await apiRequest("/api/specialties", "GET", null, token);
        const specialtiesData = result.data || [];
        
        setSpecialties(specialtiesData);
      } catch (err) {
        setError("Error al cargar las especialidades.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  const handleDeleteSpecialty = async (specialtyId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta especialidad? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      setDeletingSpecialtyId(specialtyId);
      const token = localStorage.getItem("token");
      
      await apiRequest(`/api/specialties/${specialtyId}`, "DELETE", null, token);
      
      // Actualizar la lista de especialidades
      setSpecialties(prevSpecialties => prevSpecialties.filter(specialty => specialty.id !== specialtyId));
      
      alert("Especialidad eliminada exitosamente");
    } catch (err) {
      console.error("Error al eliminar especialidad:", err);
      alert("Error al eliminar la especialidad. Por favor intente nuevamente.");
    } finally {
      setDeletingSpecialtyId(null);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  // Filtrado de especialidades
  const specialtiesFiltered = specialties.filter((specialty) =>
    specialty.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageAdmin>
      <h1 className="text-center" style={{ color: "black", marginTop: "40px" }}>
        Especialidades
      </h1>

      <div className="container mt-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <form className="form-inline" onSubmit={handleSearchSubmit}>
            <input
              className="form-control"
              type="search"
              placeholder="Buscar especialidad"
              aria-label="Buscar"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </form>
          <Link to="/admin/new-specialty">
            <button className="btn btn-secondary">Agregar Especialidad</button>
          </Link>
        </div>
        {loading && <p>Cargando especialidades...</p>}
        {error && <p className="text-danger">{error}</p>}

        <div className="row justify-content-center g-4">
          {specialtiesFiltered.length > 0 ? (
            specialtiesFiltered.map((specialty) => (
              <div className="col-md-3" key={specialty.id}>
                <Card
                  title={specialty.name}
                  subtitle={`ID: ${specialty.id}`}
                  content={[
                    `Creada: ${new Date(specialty.createdAt).toLocaleDateString()}`,
                    `Actualizada: ${new Date(specialty.updatedAt).toLocaleDateString()}`
                  ]}
                  actions={[
                    {
                      text: deletingSpecialtyId === specialty.id ? "Eliminando..." : "Eliminar",
                      onClick: () => handleDeleteSpecialty(specialty.id),
                      className: "btn btn-danger btn-sm",
                      disabled: deletingSpecialtyId === specialty.id
                    }
                  ]}
                />
              </div>
            ))
          ) : (
            !loading && !error && <p>No se encontraron especialidades.</p>
          )}
        </div>
      </div>
    </PageAdmin>
  );
} 