import { useEffect, useState } from "react";
import { Card } from "../components/card";
import { Link } from "react-router-dom";
import { PageAdmin } from "../components/pageAdmin";
import { apiRequest } from "../services/apiConection";

export function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [limite] = useState(8);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsersRawData, setAllUsersRawData] = useState([]);
  const [deletingUserId, setDeletingUserId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        const isSearching = searchTerm.trim().length > 0;
        const offset = isSearching ? 0 : (paginaActual - 1) * limite;
        const limitToUse = isSearching ? 1000 : limite;

        /* trae todos los usuarios que hay */
        const result = await apiRequest("/api/users/search", "POST", {
          limit: limitToUse,
          offset,
        }, token);

        const usersBrutos = result.data;
        
        /* se arman los datos de cada usuario */
        const usersTotales = usersBrutos.map(user => {
          return {
            id: user.id,
            nombreCompleto: `${user.name} ${user.lastname}`,
            rol: user.role, 
            email: user.email,
            dni: user.dni,
          };
        });

        setAllUsersRawData(usersTotales);

        if (!isSearching) {
            setUsers(usersTotales);
        }

      } catch (err) {
        setError("Error al cargar los usuarios.");
        console.error("Error al cargar usuarios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [paginaActual, searchTerm]); 

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      setDeletingUserId(userId);
      const token = localStorage.getItem("token");
      
      await apiRequest(`/api/users/${userId}`, "DELETE", null, token);
      
      // Actualizar la lista de usuarios
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setAllUsersRawData(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      alert("Usuario eliminado exitosamente");
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      alert("Error al eliminar el usuario. Por favor intente nuevamente.");
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPaginaActual(1); 
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  /* filtrado de usuarios incluyendo nombre, rol, email, dni, permitiendo
     que se use mayúscula o minúscula por igual */
  const usersFiltrados = allUsersRawData.filter((user) =>
    user.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.rol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (user.dni && user.dni.toLowerCase().includes(searchTerm.toLowerCase())) 
  );
  
  const usersToRender = searchTerm.trim() ? usersFiltrados : users;

  return (
    <PageAdmin>
      <h1 className="text-center" style={{ color: "black", marginTop: "40px" }}>
        Usuarios
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
          <Link to="/formulario-usuario"> 
            <button className="btn btn-secondary">Agregar Usuario</button>
          </Link>
        </div>
        {loading && <p>Cargando usuarios...</p>}
        {error && <p className="text-danger">{error}</p>}

        <div className="row justify-content-center g-4">
          {usersToRender.length > 0 ? (
            usersToRender.map((user) => (
              <div className="col-md-3" key={user.id}>
                <Card
                  title={user.nombreCompleto}
                  subtitle={`Rol: ${user.rol}`}
                  content={[
                    `Email: ${user.email}`,
                    `DNI: ${user.dni || "N/A"}`,
                  ]}
                  link={{ href: `/admin/users/edit/${user.id}`, text: "Editar" }}
                  actions={[
                    {
                      text: deletingUserId === user.id ? "Eliminando..." : "Eliminar",
                      onClick: () => handleDeleteUser(user.id),
                      className: "btn btn-danger btn-sm",
                      disabled: deletingUserId === user.id
                    }
                  ]}
                />
              </div>
            ))
          ) : (
            !loading && !error && <p>No se encontraron usuarios.</p>
          )}
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
              disabled={users.length < limite}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </PageAdmin>
  );
}