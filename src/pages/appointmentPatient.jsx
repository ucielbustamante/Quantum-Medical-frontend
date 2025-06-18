import { useEffect, useState } from "react";
import { Card } from "../components/card";
import styles from '../styles/turnos.module.css';
import { PagePatients } from "../components/pagePatients";
import { apiRequest } from "../services/apiConection";
import { useParams } from "react-router-dom";

export function Appointments() {
  const [turnos, setTurnos] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId")
  console.log('---token', token);
  
  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        const paciente = await apiRequest("/api/patients/search", "POST", null, token);
        const listaPacientes = paciente.data
        
        const pacienteFiltrado = listaPacientes.find(p => p.user_id === userId);
        console.log('---pacienteFiltrado',pacienteFiltrado);
        const responseTurnos = await apiRequest(`/api/patients/${pacienteFiltrado.id}/appointments`, "GET", null, token);
        const turnosObtenidos = responseTurnos.data || [];
        setTurnos(turnosObtenidos);
        
        console.log('--turnos', turnos);

        const responseDoctores  = await apiRequest("/api/doctors/search", "POST", { limit: 1000 }, token);
        const listaDoctores = responseDoctores.data || [];
        
        const doctorIdsTurnos = turnosObtenidos.map(t => t.doctor_id);
        const doctoresFiltrados = listaDoctores.filter(doc => doctorIdsTurnos.includes(doc.id));
        setDoctores(doctoresFiltrados);
        console.log("Turnos:", turnosObtenidos);
        console.log("Doctores filtrados:", doctoresFiltrados);
      } catch (error) {
        console.error("Error al obtener los turnos del paciente:", error);
      }
    };

    
    fetchTurnos();
  
    console.log('--turnos', turnos);
    
  }, [userId, token]);

  return (
     <PagePatients>
      <h1 className={styles.title}>Mis Turnos</h1>

      <div className={styles.container}>
        {turnos.length > 0 ? (
          <div className={styles.gridContainer}>
            {turnos.map((turno, index) => {
              const doctor = doctores.find(d => d.id === turno.doctor_id);
              return (
                <Card
                  key={index}
                  title={`Especialidad: ${doctor?.Specialties?.[0]?.name || 'Sin asignar'}`}
                  subtitle={`Médico: ${doctor?.User?.name || ''} ${doctor?.User?.lastname || ''}`}
                  content={[
                    `Fecha: ${turno.date}`,
                    `Hora: ${turno.start_time} - ${turno.end_time}`
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
