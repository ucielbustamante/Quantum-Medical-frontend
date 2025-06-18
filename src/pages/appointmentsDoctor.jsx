import { useEffect, useState } from "react";
import { Card } from "../components/card";
import styles from '../styles/turnos.module.css';
import { PagePatients } from "../components/pagePatients";
import { apiRequest } from "../services/apiConection";

export function AppointmentsDoctor() {
  const [turnos, setTurnos] = useState([]);
  const [doctor, setDoctor] = useState("");
  const [deletingAppointmentId, setDeletingAppointmentId] = useState(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId")
  
  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        const responseDoctores  = await apiRequest("/api/doctors/search", "POST", { limit: 1000 }, token);
        const listaDoctores = responseDoctores.data || [];
        const doctorFiltrado = listaDoctores.find(doc => doc.user_id === userId);

        setDoctor(doctorFiltrado);

        const responseTurnos = await apiRequest(`/api/doctors/${doctorFiltrado.id}/appointments`, "GET", null, token);
        const turnosObtenidos = responseTurnos.data || [];
        const turnosFiltrados = turnosObtenidos.filter(t => t.patient_id !== null);
        console.log('----turnosFiltrados',turnosFiltrados);
        
        setTurnos(turnosFiltrados);
        
        const paciente = await apiRequest("/api/patients/search", "POST", null, token);
        const listaPacientes = paciente.data
        
        // const pacienteFiltrado = listaPacientes.find(p => p.user_id === userId);
        // console.log('---pacienteFiltrado',pacienteFiltrado);
        
      
        // console.log("Doctores filtrados:", doctoresFiltrados);
      } catch (error) {
        console.error("Error al obtener los turnos del paciente:", error);
      }
    };

    
    fetchTurnos();
  
    console.log('--turnos', turnos);
    
  }, [userId, token]);

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este turno? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      setDeletingAppointmentId(appointmentId);
      
      await apiRequest(`/api/appointments/${appointmentId}`, "DELETE", null, token);
      
      // Actualizar la lista de turnos
      setTurnos(prevAppointments => prevAppointments.filter(appointment => appointment.id !== appointmentId));
      
      alert("Turno eliminado exitosamente");
    } catch (err) {
      console.error("Error al eliminar turno:", err);
      alert("Error al eliminar el turno. Por favor intente nuevamente.");
    } finally {
      setDeletingAppointmentId(null);
    }
  };

  return (
     <PagePatients>
      <h1 className={styles.title}>Turnos Pacientes</h1>

      <div className={styles.container}>
        {turnos.length > 0 ? (
          <div className={styles.gridContainer}>
            {turnos.map((turno, index) => {
              return (
                <Card
                  key={index}
                  title={`Paciente: `}
                  subtitle={`Especialidad: ${doctor?.Specialties?.[0]?.name || 'Sin asignar'}`}
                  content={[
                    `Fecha:${turno.date.split("T")[0]}`,
                    `Hora: ${turno.start_time} - ${turno.end_time}`,
                    `Estado: ${turno.status}`
                  ]}
                  actions={[
                    {
                      text: deletingAppointmentId === turno.id ? "Eliminando..." : "Eliminar Turno",
                      onClick: () => handleDeleteAppointment(turno.id),
                      className: "btn btn-danger btn-sm",
                      disabled: deletingAppointmentId === turno.id
                    }
                  ]}
                />
              );
            })}
          </div>
        ) : (
          <p>No tenés turnos cargados.</p>
        )}
      </div>
    </PagePatients>
  );
}
