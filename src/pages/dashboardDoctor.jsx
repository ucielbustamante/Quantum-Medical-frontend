import { PageDoctors } from "../components/pageDoctors";
import { Card } from "../components/card";

export function DashboardDoctors() {
  const storedFirstName = localStorage.getItem('userName');
  const storedLastName = localStorage.getItem('userLastName');
  return (
    <PageDoctors>
      <h1 className="text-center" style={{ color: "black", marginTop: "40px" }}>
        Dashboard Doctor {storedFirstName} {storedLastName}
      </h1>

      <div className="container mt-4">
        <div className="row justify-content-center g-4">
          
            <div className="col-md-3">
              <Card
                title="Pacientes"
                subtitle="Gestionar pacientes"
                content={[
                  "Agregar historia clinica"
                  
                  
                ]}
                links={[{ href: "#", text: "Entrar" }]}
              />
            </div>
            <div className="col-md-3">
              <Card
                title="Turnos"
                subtitle="Revisión de citas médicas"
                content={[
                  "Control de turnos asignados"
                 
                ]}
                links={[{ href: "/appoinments-doctors", text: "Entrar" }]}
              />
            </div>
            <div className="col-md-3">
              <Card
                title="Registros Clínicos"
                subtitle="Gestionar historiales médicos"
                content={[
                  "Crear y editar registros clínicos",
                  "Subir documentos médicos",
                  "Ver historial de pacientes"
                ]}
                links={[{ href: "/admin/clinical-records", text: "Entrar" }]}
              />
            </div>

          
        </div>
      </div>
    </PageDoctors>
  );
}
