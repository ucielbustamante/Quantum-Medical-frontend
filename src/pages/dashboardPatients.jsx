import { PagePatients } from "../components/pagePatients"
import { Card } from "../components/card";
import { useEffect, useState } from "react";
import { apiRequest } from "../services/apiConection";
import PatientClinicalSummary from "../components/PatientClinicalSummary";
import PatientAppointments from "../components/PatientAppointments";

export function DashboardPatients() {
  const [patientId, setPatientId] = useState(null);

  useEffect(() => {
    const fetchPatientId = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        
        const response = await apiRequest("/api/patients/search", "POST", null, token);
        const patients = response.data || [];
        const currentPatient = patients.find(p => p.user_id === userId);
        
        if (currentPatient) {
          setPatientId(currentPatient.id);
        }
      } catch (err) {
        console.error('Error al obtener ID del paciente:', err);
      }
    };

    fetchPatientId();
  }, []);

  return (
    <PagePatients>
      <h1 className="text-center" style={{ color: "black", marginTop: "40px" }}>
        Dashboard Paciente
      </h1>

      <div className="container mt-4">
        <div className="row justify-content-center g-4 mb-4">
          <div className="col-md-3">
            <Card
              title="Sacar Turno"
              subtitle="Sacar turno para la especialidad deseada"
              content={[]}
              links={[{ href: "/appointment", text: "Entrar" }]}
            />
          </div>
          <div className="col-md-3">
            <Card
              title="Mis Registros Clínicos"
              subtitle="Historial médico y documentos"
              content={[]}
              links={[{ href: "/patient/clinical-records", text: "Ver Todos" }]}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            {patientId && <PatientAppointments patientId={patientId} />}
          </div>
          <div className="col-md-6">
            <PatientClinicalSummary isPatient={true} />
          </div>
        </div>
      </div>
    </PagePatients>
  );
}
