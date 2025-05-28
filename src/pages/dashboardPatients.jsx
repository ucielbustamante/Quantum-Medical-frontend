import { PagePatients } from "../components/pagePatients"
import { Card } from "../components/card";

export function DashboardPatients() {
  return (
    <PagePatients>
      <h1 className="text-center" style={{ color: "black", marginTop: "40px" }}>
        Dashboard Paciente
      </h1>

      <div className="container mt-4">
        <div className="row justify-content-center g-4">
          
            <div className="col-md-3">
              <Card
                title="Mis Turnos"
                subtitle="Revisión de mis citas médicas"
                content={[]}
                link={{ href: "/mis-turnos", text: "Entrar" }}
              />
            </div>
            <div className="col-md-3">
              <Card
                title="Sacar Turno"
                subtitle="Sacar turno para la especialidad deseada"
                content={[]}
                link={{ href: "/newAppointment", text: "Entrar" }}
              />
            </div>
          
        </div>
      </div>
    </PagePatients>
  );
}
