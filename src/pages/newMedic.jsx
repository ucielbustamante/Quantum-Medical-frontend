import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FormGenerico } from "../components/formGenerico";
import { PageAdmin } from "../components/pageAdmin";
import { apiRequest } from "../services/apiConection";
import formStyles from "../styles/formsGeneral.module.css";

export function NuevoMedico() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dni, setDni] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialtiesSeleccionadas, setSpecialtiesSeleccionadas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [horariosMedico, setHorariosMedico] = useState([]);

  const [currentWeekday, setCurrentWeekday] = useState("");
  const [currentStartTime, setCurrentStartTime] = useState("");
  const [currentEndTime, setCurrentEndTime] = useState("");
  const [currentSlotDurationMin, setCurrentSlotDurationMin] = useState("");

  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await apiRequest("/api/specialties", "GET", null, token);
        setEspecialidadesDisponibles(response.data || []);
      } catch (err) {
        console.error("Error al cargar especialidades", err);
      }
    };

    fetchEspecialidades();
  }, []);

  const diasDeSemana = [
    { value: "0", label: "Domingo" },
    { value: "1", label: "Lunes" },
    { value: "2", label: "Martes" },
    { value: "3", label: "Miércoles" },
    { value: "4", label: "Jueves" },
    { value: "5", label: "Viernes" },
    { value: "6", label: "Sábado" },
  ];

  const handleAddHorario = () => {
    if (currentWeekday && currentStartTime && currentEndTime && currentSlotDurationMin) {
      const nuevoHorario = {
        weekday: parseInt(currentWeekday),
        start_time: currentStartTime,
        end_time: currentEndTime,
        slot_duration_min: parseInt(currentSlotDurationMin),
      };
      setHorariosMedico([...horariosMedico, nuevoHorario]);
      setCurrentWeekday("");
      setCurrentStartTime("");
      setCurrentEndTime("");
      setCurrentSlotDurationMin("");
      setMensaje("");
    } else {
      setMensaje("Por favor, completa todos los campos del horario antes de agregarlo.");
    }
  };

  const handleRemoveHorario = (indexToRemove) => {
    setHorariosMedico(horariosMedico.filter((_, index) => index !== indexToRemove));
  };

  const camposGenerales = [
    { label: "Nombre", type: "text", name: "name", value: name, onChange: (e) => setName(e.target.value) },
    { label: "Apellido", type: "text", name: "lastname", value: lastname, onChange: (e) => setLastname(e.target.value) },
    { label: "Email", type: "email", name: "email", value: email, onChange: (e) => setEmail(e.target.value) },
    { label: "Contraseña", type: "password", name: "password", value: password, onChange: (e) => setPassword(e.target.value) },
    { label: "DNI", type: "text", name: "dni", value: dni, onChange: (e) => setDni(e.target.value) },
    { label: "Matrícula", type: "text", name: "license_number", value: licenseNumber, onChange: (e) => setLicenseNumber(e.target.value) },
    {
      label: "Especialidades",
      type: "select",
      name: "specialties",
      value: specialtiesSeleccionadas,
      onChange: (e) => setSpecialtiesSeleccionadas(Array.from(e.target.selectedOptions, (option) => option.value)),
      opciones: especialidadesDisponibles.map((esp) => ({ value: esp.id, label: esp.name })),
      multiple: true,
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMensaje("");

    const token = localStorage.getItem("token");

    try {
      const userResponse = await apiRequest(
        "/api/users",
        "POST",
        {
          name,
          lastname,
          email,
          password,
          dni,
          role: "Doctor",
        },
        token
      );

      const createdUser = userResponse.data.user;
      console.log("Usuario creado:", createdUser);

      const doctorSearchResponse = await apiRequest(
        "/api/doctors/search",
        "POST",
        {
          name: createdUser.name,
          lastname: createdUser.lastname,
          email: createdUser.email,
          limit: 1,
        },
        token
      );

      if (!doctorSearchResponse.data || doctorSearchResponse.data.length === 0) {
        throw new Error("No se pudo encontrar el doctor creado.");
      }

      const doctorData = doctorSearchResponse.data[0];
      console.log("Doctor encontrado:", doctorData);

      await apiRequest(
        `/api/doctors/${doctorData.id}`,
        "PUT",
        {
          license_number: licenseNumber,
        },
        token
      );

      for (const espName of specialtiesSeleccionadas) {
        const especialidad = especialidadesDisponibles.find((e) => e.name === espName || e.id === parseInt(espName));
        if (especialidad) {
          await apiRequest(
            "/api/doctor-specialties",
            "POST",
            {
              doctor_id: doctorData.id,
              specialty_id: especialidad.id,
            },
            token
          );
        }
      }

      if (horariosMedico.length > 0) {
        for (const horario of horariosMedico) {
          await apiRequest(
            `/api/doctors/${doctorData.id}/availability`,
            "POST",
            {
              weekday: horario.weekday,
              start_time: horario.start_time,
              end_time: horario.end_time,
              slot_duration_min: horario.slot_duration_min,
            },
            token
          );
        }
        setMensaje("Doctor y horarios creados exitosamente.");
      } else {
        setMensaje("Doctor creado exitosamente. No se especificaron horarios.");
      }

      setName("");
      setLastname("");
      setEmail("");
      setPassword("");
      setDni("");
      setLicenseNumber("");
      setSpecialtiesSeleccionadas([]);
      setHorariosMedico([]);
      setCurrentWeekday("");
      setCurrentStartTime("");
      setCurrentEndTime("");
      setCurrentSlotDurationMin("");

      setTimeout(() => {
        navigate("/medicos");
      }, 2000);
    } catch (error) {
      console.error("Error en el proceso de creación:", error);
      setMensaje(error.message || "Error al crear doctor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageAdmin>
      <div className="container mt-4">
        <FormGenerico
          titulo="Agregar Nuevo Médico"
          campos={camposGenerales}
          onSubmit={handleSubmit}
        />

        <div className={`${formStyles.container} mt-4`}> 
          <h2 style={{ marginBottom: '1rem' }}>Agregar Horarios de Atención</h2>
          <div className={formStyles.form}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Día de la Semana</label>
              <select
                name="currentWeekday"
                value={currentWeekday}
                onChange={(e) => setCurrentWeekday(e.target.value)}
                className={formStyles.select}
              >
                <option value="">Seleccionar</option>
                {diasDeSemana.map((dia, i) => (
                  <option key={i} value={dia.value}>
                    {dia.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Hora de Inicio</label>
              <input
                type="time"
                name="currentStartTime"
                value={currentStartTime}
                onChange={(e) => setCurrentStartTime(e.target.value)}
                className={formStyles.input}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Hora de Fin</label>
              <input
                type="time"
                name="currentEndTime"
                value={currentEndTime}
                onChange={(e) => setCurrentEndTime(e.target.value)}
                className={formStyles.input}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Duración del Turno (minutos)</label>
              <input
                type="number"
                name="currentSlotDurationMin"
                value={currentSlotDurationMin}
                onChange={(e) => setCurrentSlotDurationMin(e.target.value)}
                className={formStyles.input}
              />
            </div>
            <button type="button" onClick={handleAddHorario} className={`btn btn-primary ${formStyles.submitButton}`}>
              Añadir Horario
            </button>
          </div>
          
          {horariosMedico.length > 0 && (
            <div className="mt-4">
              <h5 style={{ marginBottom: '1rem' }}>Horarios Agregados:</h5>
              <ul className="list-group">
                {horariosMedico.map((horario, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    {diasDeSemana.find(d => parseInt(d.value) === horario.weekday)?.label} de {horario.start_time} a {horario.end_time} (Turnos de {horario.slot_duration_min} min)
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveHorario(index)}
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {isLoading && <p className="mt-3">Creando doctor, por favor espere...</p>}
        {mensaje && <p className="mt-3">{mensaje}</p>}
      </div>
    </PageAdmin>
  );
}