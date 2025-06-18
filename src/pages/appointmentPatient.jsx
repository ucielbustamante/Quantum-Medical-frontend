import { useEffect, useState } from "react";
import { Card } from "../components/card";
import styles from '../styles/turnos.module.css';
import { PagePatients } from "../components/pagePatients";
import { apiRequest } from "../services/apiConection";

export function Appointments() {
  const [turnos, setTurnos] = useState([]);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId")

  
  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        //me falta conseguir el id del paciente, porque pensaba usar el userId para buscar
       // en pacientes y obtener el id, pero solo puede ingresar admin
        const response = await apiRequest(`/api/patients/:idPatient/appointments`, "GET", null, token);
        setTurnos(response.data || []);
        console.log("---turnosPaciente", response.data);
      } catch (error) {
        console.error("Error al obtener los turnos del paciente:", error);
      }
    };

    if ( token) {
      fetchTurnos();
    }
  }, [ token]);

  return (
    <PagePatients>
      <h1 className={styles.title}>Mis Turnos</h1>

      <div className={styles.container}>
        {turnos.length > 0 ? (
          <div className={styles.gridContainer}>
            {turnos.map((turno, index) => (
              <Card
                key={index}
                title={`Especialidad: ${turno.Doctor.Specialties[0]?.name || "Sin asignar"}`}
                subtitle={`Médico: ${turno.Doctor.User.name} ${turno.Doctor.User.lastname}`}
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
