import { useEffect, useState } from "react"; // Importa useEffect y useState
import { Card } from "../components/card";
import { Link } from "react-router-dom";
import { PageAdmin } from "../components/pageAdmin";
import { apiRequest } from "../services/apiConection"; // Asegúrate de que la ruta sea correcta

export function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await apiRequest("/users");
        setUsers(result.data); 
      } catch (err) {
        setError("Error al cargar los usuarios.");
        console.error("Error al cargar usuarios:", err);
      } finally {
        setLoading(false); 
      }
    };

    fetchUsers(); 
  }, []); 

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

      <div className="container mt-4">
        {loading && <p>Cargando usuarios...</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loading && !error && (
          <div className="row justify-content-center g-4">
            {users.map((user) => (
              <div className="col-md-3" key={user.id}>
                {" "}
                <Card
                  title={`${user.name} ${user.lastname}`}
                  subtitle={`Rol: ${user.role}`}
                  content={[`Email: ${user.email}`]}
                  link={{ href: `/users/${user.id}`, text: "Editar" }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </PageAdmin>
  );
}
