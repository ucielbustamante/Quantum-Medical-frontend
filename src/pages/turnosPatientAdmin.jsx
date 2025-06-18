import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../components/card";
import styles from '../styles/turnos.module.css';
import { PageAdmin } from "../components/pageAdmin";
import { apiRequest } from "../services/apiConection";

export function Turnos() {
  const { id } = useParams();
  const [turnos, setTurnos] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  console.log('---userId',id);
  
  useEffect(() => {
    const fetchTurnos = async () => {
      try {
       
        const responseTurnos = await apiRequest(`/api/patients/${id}/appointments`, "GET", null, token);
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
        console.error('Error al traer turnos del paciente:', error);
        setError("No se pudieron cargar los turnos.");
      }
    };

    fetchTurnos(); 
    
  }, [id, token]);

  return (
    <PageAdmin>
      <h1 className={styles.title}>Turnos del Paciente</h1>

      {error && <p className="text-danger">{error}</p>}

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
                          `Fecha:${turno.date.split("T")[0]}`,
                          `Hora: ${turno.start_time} - ${turno.end_time}`
                        ]}
                      />
                    );
                  })}
                </div>
              ) : (
                <p>No tiene turnos cargados.</p>
              )}
            </div>
    </PageAdmin>
  );
}
