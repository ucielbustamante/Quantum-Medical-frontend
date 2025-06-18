import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../components/card";
import styles from '../styles/turnos.module.css';
import { PageAdmin } from "../components/pageAdmin";
import { apiRequest } from "../services/apiConection";

export function Turnos() {
  const { id } = useParams();
  const [turnos, setTurnos] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  console.log('---patientId',id);
  
  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        const response = await apiRequest(`/api/patients/${id}/appointments`, 'GET', null, token);
        setTurnos(response.data);
      } catch (error) {
        console.error('Error al traer turnos del paciente:', error);
        setError("No se pudieron cargar los turnos.");
      }
    };

    if (id) {
      fetchTurnos();
    }
  }, [id, token]);

  return (
    <PageAdmin>
      <h1 className={styles.title}>Turnos del Paciente</h1>

      {error && <p className="text-danger">{error}</p>}

      <div className={styles.container}>
        {turnos.length > 0 ? (
          <div className={styles.gridContainer}>
            {turnos.map((turno, index) => (
              <Card
                key={index}
                title={`Especialidad: ${turno.specialty}`}
                subtitle={`Médico: ${turno.doctorName}`}
                content={[
                  `Fecha: ${turno.date}`,
                  `Hora: ${turno.time}`,
                  `Estado: ${turno.status}`
                ]}
              />
            ))}
          </div>
        ) : (
          <p>No hay turnos para este paciente.</p>
        )}
      </div>
    </PageAdmin>
  );
}
