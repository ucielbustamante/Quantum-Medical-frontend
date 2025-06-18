import { useEffect, useState } from "react";
import { Card } from "../components/card";
import styles from '../styles/turnos.module.css';
import { PagePatients } from "../components/pagePatients";
import { apiRequest } from "../services/apiConection";
import { useParams } from "react-router-dom";

export function Appointments() {
  const [turnos, setTurnos] = useState([]);
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
        const response = await apiRequest(`/api/patients/${pacienteFiltrado.id}/appointments`, "GET", null, token);
        setTurnos(response.data || []);
        console.log("---turnosPaciente", response.data);
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
            {turnos.map((turno, index) => (
              <Card
                key={index}
                title={`Especialidad:`}
                subtitle={`Médico: `}
                content={[
                  `Fecha: ${turno.date}`,
                  `Hora: ${turno.start_time} - ${turno.end_time}`
                ]}
              />
            ))}
          </div>
        ) : (
          <p>No tenés turnos cargados.</p>
        )}
      </div>
    </PagePatients>
  );
}
