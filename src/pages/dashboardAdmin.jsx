import { PageAdmin } from "../components/pageAdmin";
import { Card } from "../components/card";

export function DashboardAdmin() {
  return (
    <PageAdmin>
      <h1 className="text-center" style={{ color: "black", marginTop: "40px" }}>
        Dashboard Admin
      </h1>

      <div className="container mt-4">
        <div className="row justify-content-center g-4">
          
            <div className="col-md-3">
              <Card
                title="Usuarios"
                subtitle="Gestionar cuentas de usuarios"
                content={[
                  "Crear, editar o eliminar usuarios",
                  "Ver roles asignados",
                  
                ]}
                links={[{ href: "/users/all-users", text: "Entrar" }]}
              />
            </div>
           
            <div className="col-md-3">
              <Card
                title="Pacientes"
                subtitle="Gestionar pacientes"
                content={[
                  "Ver datos del paciente, turnos",
                  "Historial clinico",
                  
                ]}
                links={[{ href: "/admin/all-patients", text: "Entrar" }]}
              />
            </div>
            <div className="col-md-3">
              <Card
                title="Medicos"
                subtitle="Listado de profesionales registrados"
                content={[
                  "Ver médicos por especialidad",
                  "Editar, eliminar o inhabilitar médicos"
                ]}
                links={[{ href: "/medicos", text: "Entrar" }]}
              />
            </div>
          
        </div>
      </div>
    </PageAdmin>
  );
}
