import { useEffect, useState } from "react";
import { FormGenerico } from "../components/formGenerico";
import { PagePatients } from "../components/pagePatients";
import { apiRequest } from "../services/apiConection";
import { appointmentService } from "../services/appointmentService";
import { useNavigate } from "react-router-dom"

export function NewAppointment() {
  const navigate = useNavigate()
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("");
  const [medicoSeleccionado, setMedicoSeleccionado] = useState("");
  const [horarioSeleccionado, setHorarioSeleccionado] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Cargar especialidades al montar el componente
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        setLoading(true);
        const result = await apiRequest("/api/specialties", "GET", null, token);
        console.log('---especialidades', result.data);
        
        setEspecialidades(result.data || []);
      } catch (err) {
        console.error("Error al obtener especialidades", err);
        setError("Error al cargar especialidades");
      } finally {
        setLoading(false);
      }
    };

    fetchEspecialidades();
  }, [token]);

  // Cargar médicos cuando se selecciona una especialidad
  useEffect(() => {
    const fetchMedicos = async () => {
      if (!especialidadSeleccionada) {
        setMedicos([]);
        setMedicoSeleccionado("");
        setHorarios([]);
        setHorarioSeleccionado("");
        return;
      }

      try {
        setLoading(true);
        const result = await apiRequest("/api/doctors/search", "POST", { limit: 1000 }, token);
        const doctoresFiltrados = result.data.filter((medico) =>
          medico.Specialties.some((esp) => esp.id === especialidadSeleccionada)
        );
        console.log('---doctores result', result);
        
        const doctoresMapeados = doctoresFiltrados.map((doc) => ({
          value: doc.id,
          label: `${doc.User.name} ${doc.User.lastname}`,
        }));

        setMedicos(doctoresMapeados);
        setError("");
      } catch (err) {
        console.error("Error al obtener médicos", err);
        setError("Error al cargar médicos");
        setMedicos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicos();
  }, [especialidadSeleccionada, token]);

  // Cargar horarios disponibles cuando se selecciona médico y fecha
  useEffect(() => {
    const fetchHorarios = async () => {
      console.log('----medicoSeleccionado ', medicoSeleccionado);
      
      if (!medicoSeleccionado || !fechaSeleccionada) {
        setHorarios([]);
        setHorarioSeleccionado("");
        return;
      }

      try {
        setLoading(true);
        setError("");
        
        // Validar fecha usando el servicio
        const validation = appointmentService.validateReservationDate(fechaSeleccionada);
        if (!validation.isValid) {
          setError(validation.message);
          setHorarios([]);
          return;
        }

        // Obtener slots disponibles usando el servicio
        const slotsResponse = await appointmentService.getAvailableSlots(
          medicoSeleccionado, 
          fechaSeleccionada,
          //Fin de la fecha que se selecciona
          fechaSeleccionada + "T23:59:59"
        );

        const turnosDisponibles = slotsResponse.data || [];
        console.log('--turnosDisponibles', turnosDisponibles);
        
        if (turnosDisponibles.length === 0) {
          setError("No hay turnos disponibles para la fecha seleccionada");
          setHorarios([]);
          return;
        }
        
        const horariosFormateados = turnosDisponibles.map((turno) => ({
          value: JSON.stringify({
            appointment_id: turno.id,
            start_time: turno.start_time,
            end_time: turno.end_time,
          }),
          label: appointmentService.formatTimeSlot(
            turno.start_time, 
            turno.end_time, 
            turno.slot_duration_min
          ),
        }));

        setHorarios(horariosFormateados);
        setError("");
      } catch (err) {
        console.error("Error al obtener horarios", err);
        setError("Error al cargar horarios disponibles");
        setHorarios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHorarios();
  }, [medicoSeleccionado, fechaSeleccionada]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!especialidadSeleccionada || !medicoSeleccionado || !fechaSeleccionada || !horarioSeleccionado) {
      setError("Por favor complete todos los campos");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const horario = JSON.parse(horarioSeleccionado);
      
      // Crear la cita usando el servicio
      const turno = await appointmentService.createAppointment({
        doctor_id: medicoSeleccionado,
        date: fechaSeleccionada,
        start_time: horario.start_time,
        end_time: horario.end_time,
      });
      
      console.log('---turno creado', turno);
      
      // Limpiar formulario
      setEspecialidadSeleccionada("");
      setMedicoSeleccionado("");
      setHorarioSeleccionado("");
      setFechaSeleccionada("");
      setHorarios([]);
      setError("");

      // Mostrar mensaje de éxito y redirigir
      alert("¡Turno reservado exitosamente!");
      
      setTimeout(() => {
        navigate("/patient/dashboard")
      }, 2000)

    } catch (err) {
      console.error("Error al reservar turno", err);
      
      // Manejar errores específicos de la API
      if (err.message?.includes('24 h de anticipación')) {
        setError("Debe reservar con al menos 24 horas de anticipación");
      } else if (err.message?.includes('ya ocupado')) {
        setError("El turno ya no está disponible. Por favor seleccione otro horario.");
      } else if (err.message?.includes('no disponible')) {
        setError("Horario no disponible para este doctor");
      } else {
        setError("Ocurrió un error al reservar el turno. Por favor intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const campos = [
    {
      label: "Especialidad",
      name: "especialidad",
      value: especialidadSeleccionada,
      onChange: (e) => {
        setEspecialidadSeleccionada(e.target.value);
        setError(""); // Limpiar errores al cambiar
      },
      opciones: especialidades.map((esp) => ({ value: esp.id, label: esp.name })),
      disabled: loading,
    },
    {
      label: "Médico",
      name: "medico",
      value: medicoSeleccionado,
      onChange: (e) => {
        setMedicoSeleccionado(e.target.value);
        setError(""); // Limpiar errores al cambiar
      },
      opciones: medicos,
      disabled: loading || !especialidadSeleccionada,
    },
    {
      label: "Fecha",
      name: "fecha",
      type: "date",
      value: fechaSeleccionada,
      onChange: (e) => {
        setFechaSeleccionada(e.target.value);
        setError(""); // Limpiar errores al cambiar
      },
      disabled: loading || !medicoSeleccionado,
      min: appointmentService.getMinimumReservationDate(), // Usar el servicio
    },
    {
      label: "Horario",
      name: "horario",
      value: horarioSeleccionado,
      onChange: (e) => {
        setHorarioSeleccionado(e.target.value);
        setError(""); // Limpiar errores al cambiar
      },
      opciones: horarios,
      disabled: loading || !fechaSeleccionada || horarios.length === 0,
    },
  ];

  return (
    <PagePatients>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#2c3e50' }}>
          Reservar turno médico
        </h2>
        
        {error && (
          <div style={{
            background: '#e74c3c',
            color: 'white',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        {loading && (
          <div style={{
            background: '#3498db',
            color: 'white',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Cargando...
          </div>
        )}

        <FormGenerico
          campos={campos}
          onSubmit={handleSubmit}
          titulo=""
          botonTexto={loading ? "Reservando..." : "Reservar Turno"}
          disabled={loading}
        />
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#f8f9fa', 
          borderRadius: '4px',
          fontSize: '14px',
          color: '#6c757d'
        }}>
          <strong>Información importante:</strong>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Debe reservar con al menos 24 horas de anticipación</li>
            <li>Los turnos se pueden cancelar hasta 24 horas antes</li>
            <li>Llegue 10 minutos antes de su cita</li>
          </ul>
        </div>
      </div>
    </PagePatients>
  );
}
