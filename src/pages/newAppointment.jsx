import { useEffect, useState } from "react";
import { FormGenerico } from "../components/formGenerico";
import { PagePatients } from "../components/pagePatients";
import { apiRequest } from "../services/apiConection";
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

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const result = await apiRequest("/api/specialties", "GET", null, token);
        console.log('---especialidades', result.data);
        
        setEspecialidades(result.data || []);
      } catch (err) {
        console.error("Error al obtener especialidades", err);
      }
    };

    fetchEspecialidades();
  }, []);
  

  useEffect(() => {
    const fetchMedicos = async () => {
      if (!especialidadSeleccionada) {
        setMedicos([]);
        return;
      }

      try {
        const result = await apiRequest("/api/doctors/search", "POST", { limit: 1000 }, token);
        const doctoresFiltrados = result.data.filter((medico) =>
          medico.Specialties.some((esp) => esp.id === especialidadSeleccionada)
        );
        console.log('---doctores result',result);
        
        const doctoresMapeados = doctoresFiltrados.map((doc) => ({
          value: doc.id,
          label: `${doc.User.name} ${doc.User.lastname}`,
        }));

        setMedicos(doctoresMapeados);
      } catch (err) {
        console.error("Error al obtener médicos", err);
      }
    };

    fetchMedicos();
  }, [especialidadSeleccionada]);

  useEffect(() => {
  const fetchHorarios = async () => {
    console.log('----medicoSeleccionado ',medicoSeleccionado);
    
    if (!medicoSeleccionado) {
      setHorarios([]);
      return;
    }

    try {
      const fecha = new Date(fechaSeleccionada);
      const diaSemana = fecha.getDay();
      console.log('---fecha',fecha);
      console.log('---fechas seleccionada', fechaSeleccionada);
      
      
      const disponibilidadResponse = await apiRequest("/api/availability", "GET", null, token);
      const disponibilidadFiltrada = disponibilidadResponse.data.filter(
        (item) => item.Doctor?.id === medicoSeleccionado && item.weekday === diaSemana
      );
      console.log('---disponibilidadResponse',disponibilidadResponse);
      
      if (disponibilidadFiltrada.length === 0) {
        setHorarios([]);
        return; 
      }

      const slotsResponse = await apiRequest(
        `/api/doctors/${medicoSeleccionado}/available-slots?startDate=${fechaSeleccionada}&endDate=${fechaSeleccionada}`,
        "GET",
        null,
        token
      );

      const turnosDisponibles = slotsResponse.data || [];
      console.log('--turnosDisponibles',turnosDisponibles);
      
      const horariosFormateados = turnosDisponibles.map((turno) => ({
        value: JSON.stringify({
          start_time: turno.start_time,
          end_time: turno.end_time,
        }),
        label: `${turno.start_time.slice(0, 5)} - ${turno.end_time.slice(0, 5)} (${turno.duration_minutes} min)`,
      }));

      setHorarios(horariosFormateados);
    } catch (err) {
      console.error("Error al obtener horarios", err);
    }
  };

  fetchHorarios();
}, [medicoSeleccionado, fechaSeleccionada]);


  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      const horario = JSON.parse(horarioSeleccionado);
      const turno = await apiRequest("/api/appointments", "POST", {
        doctor_id: medicoSeleccionado,
        date: fechaSeleccionada,
        start_time: horario.start_time,
        end_time: horario.end_time,
      }, token);
      console.log('---turno', turno);
      
      setEspecialidadSeleccionada("");
      setMedicoSeleccionado("");
      setHorarioSeleccionado("");
      setFechaSeleccionada("");

      setTimeout(() => {
        navigate("/patient/dashboard")
      }, 2000)

    } catch (err) {
      console.error("Error al reservar turno", err);
      alert("Ocurrió un error al reservar el turno.");
    }
  };

  const campos = [
    {
      label: "Especialidad",
      name: "especialidad",
      value: especialidadSeleccionada,
      onChange: (e) => setEspecialidadSeleccionada(e.target.value),
      opciones: especialidades.map((esp) => ({ value: esp.id, label: esp.name })),
    },
    {
      label: "Médico",
      name: "medico",
      value: medicoSeleccionado,
      onChange: (e) => setMedicoSeleccionado(e.target.value),
      opciones: medicos,
    },
    {
      label: "Fecha",
      name: "fecha",
      type: "date",
      value: fechaSeleccionada,
      onChange: (e) => setFechaSeleccionada(e.target.value),
    },
    {
      label: "Horario",
      name: "horario",
      value: horarioSeleccionado,
      onChange: (e) => setHorarioSeleccionado(e.target.value),
      opciones: horarios,
    },
  ];

  return (
    <PagePatients>
      <FormGenerico
        campos={campos}
        onSubmit={handleSubmit}
        titulo="Reservar turno médico"
        botonTexto="Reservar"
      />
    </PagePatients>
  );
}
