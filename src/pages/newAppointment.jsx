import { useEffect, useState } from "react";
import { FormGenerico } from "../components/formGenerico";
import { PagePatients } from "../components/pagePatients";
import { apiRequest } from "../services/apiConection";
import { useNavigate } from "react-router-dom"

//la idea era usar dayjs, pero no puedo instalarlo
function generarHorarios(startStr, endStr, duracionMin) {
  const horarios = [];

  const [startH, startM] = startStr.split(":").map(Number);
  const [endH, endM] = endStr.split(":").map(Number);

  const startDate = new Date(0, 0, 0, startH, startM);
  const endDate = new Date(0, 0, 0, endH, endM);

  while (startDate < endDate) {
    const siguiente = new Date(startDate.getTime() + duracionMin * 60000);

    if (siguiente > endDate) break;

    const formato = (n) => n.toString().padStart(2, "0");

    horarios.push({
      start_time: `${formato(startDate.getHours())}:${formato(startDate.getMinutes())}:00`,
      end_time: `${formato(siguiente.getHours())}:${formato(siguiente.getMinutes())}:00`,
      label: `${formato(startDate.getHours())}:${formato(startDate.getMinutes())} - ${formato(siguiente.getHours())}:${formato(siguiente.getMinutes())}`
    });

    startDate.setMinutes(startDate.getMinutes() + duracionMin);
  }

  return horarios;
}

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
      if (!medicoSeleccionado) {
        setHorarios([]);
        return;
      }

      try {
        const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        
        const result = await apiRequest("/api/availability", "GET", null, token);
        const disponibilidadFiltrada = result.data.filter((item) => item.Doctor?.id === medicoSeleccionado);
       
        const diaSemanaSeleccionado = new Date(fechaSeleccionada).getDay();

        const horariosFormateados = [];
        disponibilidadFiltrada.forEach((item) => {
          if (item.weekday !== diaSemanaSeleccionado) return;

          const turnos = generarHorarios(item.start_time, item.end_time, item.slot_duration_min);

          turnos.forEach((t) => {
            horariosFormateados.push({
              value: JSON.stringify({
                start_time: t.start_time,
                end_time: t.end_time,
              }),
              label: t.label,
            });
          });
        })

        setHorarios(horariosFormateados);


      } catch (err) {
        console.error("Error al obtener horarios", err);
      }
    };

    fetchHorarios();
  }, [medicoSeleccionado, fechaSeleccionada]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fechaSeleccionada) return alert("Debe seleccionar una fecha");
    if (!horarioSeleccionado) return alert("Debe seleccionar un horario");

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
