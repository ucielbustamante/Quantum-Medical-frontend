import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/apiConection"
import { PageAdmin } from "./pageAdmin";
import { Card } from "./card";

export function Especialidad() {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const result = await apiRequest("/specialties");
        setSpecialties(result.data);
      } catch (err) {
        setError("Error al cargar las especialidades.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  return (
    <PageAdmin>
      <h1 className="text-center" style={{ color: "black", marginTop: "40px" }}>
        Especialidad
      </h1>

      <div className="d-flex justify-content-end me-4 mb-3">
        <Link to="/specialities">
          <button className="btn btn-secondary">Agregar Especialidad</button>
        </Link>
      </div>

      <div className="container mt-4">
        {loading && <p>Cargando especialidades...</p>}
        {error && <p className="text-danger">{error}</p>}

        <div className="row justify-content-center g-4">
          {specialties.map((item) => (
            <div className="col-md-3" key={item.id}>
                {/* en esta card podria redirigir a medicos asociados de la especialidad tal vez */}
              <Card
                title="Especialidad"
                subtitle={item.name}
                content={[]}
                link={{
                  href: `/specialities/${item.id}`,
                  text: "Ver más"
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </PageAdmin>
  );
}
