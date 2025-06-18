import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FormGenerico } from "../components/formGenerico";
import { PageAdmin } from "../components/pageAdmin";
import { apiRequest } from "../services/apiConection";
import formStyles from "../styles/formsGeneral.module.css";

export function EditarMedico() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialtiesSeleccionadas, setSpecialtiesSeleccionadas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [doctorData, setDoctorData] = useState(null);
  const [specialtiesActuales, setSpecialtiesActuales] = useState([]);

  const [horariosMedico, setHorariosMedico] = useState([]);
  const [originalHorariosMedico, setOriginalHorariosMedico] = useState([]);

  const [currentWeekday, setCurrentWeekday] = useState("");
  const [currentStartTime, setCurrentStartTime] = useState("");
  const [currentEndTime, setCurrentEndTime] = useState("");
  const [currentSlotDurationMin, setCurrentSlotDurationMin] = useState("");

  const diasDeSemana = [
    { value: "0", label: "Domingo" },
    { value: "1", label: "Lunes" },
    { value: "2", label: "Martes" },
    { value: "3", label: "Miércoles" },
    { value: "4", label: "Jueves" },
    { value: "5", label: "Viernes" },
    { value: "6", label: "Sábado" },
  ];

  useEffect(() => {
    //aca traigo las especialidades totales para mostrar en la edicion
    const fetchEspecialidades = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await apiRequest("/api/specialties", "GET", null, token);
        setEspecialidadesDisponibles(response.data || []);
      } catch (err) {
        console.error("Error al cargar especialidades", err);
        setMensaje("Error al cargar especialidades");
      }
    };

    fetchEspecialidades();
  }, []);

  useEffect(() => {
    const fetchDoctorAndAvailabilityData = async () => {
      if (!id) return;

      try {
        const token = localStorage.getItem("token");

        //traigo todos los doctores y luego filtro por ID comparando con el ID del doc que se selecciono
        const result = await apiRequest("/api/doctors/search", "POST", { limit: 1000 }, token);
        const doctor = result.data.find((doc) => doc.id === id);

        if (!doctor) {
          setMensaje("Médico no encontrado");
          setLoadingData(false);
          return;
        }

        setDoctorData(doctor);
        setName(doctor.User?.name || doctor.name || "");
        setLastname(doctor.User?.lastname || doctor.lastname || "");
        setEmail(doctor.User?.email || doctor.email || "");
        setDni(doctor.User?.dni || doctor.dni || "");
        setLicenseNumber(doctor.license_number || "");

        //aca trae trae las especialidades de todos los medicos desde el back
        const specialtiesResponse = await apiRequest("/api/doctor-specialties", "GET", null, token);
        const allDoctorSpecialties = specialtiesResponse.data;

        //se filtran los medicos por ID para solo quedarse con el que coincida con el med actual
        const specialtiesDelMedico = allDoctorSpecialties.filter((ds) => ds.doctor_id === id);

        let doctorSpecialties = [];
        for (const idEspMed of specialtiesDelMedico) {
          const findSpecialties = especialidadesDisponibles.find((e) => e.id === idEspMed.specialty_id);
          if (findSpecialties) {
            doctorSpecialties.push(findSpecialties);
          }
        }
        setSpecialtiesActuales(doctorSpecialties);
        setSpecialtiesSeleccionadas(doctorSpecialties.map((e) => e.id));

        const availabilityResponse = await apiRequest(`/api/doctors/${id}/availability`, "GET", null, token);
        if (availabilityResponse.data) {
          setHorariosMedico(availabilityResponse.data);
          setOriginalHorariosMedico(availabilityResponse.data);
        } else {
          setHorariosMedico([]);
          setOriginalHorariosMedico([]);
        }
      } catch (error) {
        console.error("Error al cargar datos del médico o horarios:", error);
        setMensaje("Error al cargar los datos del médico o sus horarios.");
      } finally {
        setLoadingData(false);
      }
    };

    if (especialidadesDisponibles.length > 0 || id) {
      fetchDoctorAndAvailabilityData();
    }
  }, [id, especialidadesDisponibles]);

  const handleAddHorario = () => {
    if (currentWeekday && currentStartTime && currentEndTime && currentSlotDurationMin) {
      const nuevoHorario = {
        id: `new-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        weekday: parseInt(currentWeekday),
        start_time: currentStartTime,
        end_time: currentEndTime,
        slot_duration_min: parseInt(currentSlotDurationMin),
        doctor_id: id,
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

  const handleRemoveHorario = (idToRemove) => {
    setHorariosMedico(horariosMedico.filter((horario) => horario.id !== idToRemove));
  };

  //para manejar cuando se cambian las especialidades
  const handleChangeEspecialidades = (e) => {
    const seleccionadas = Array.from(e.target.selectedOptions, (option) => option.value);
    setSpecialtiesSeleccionadas(seleccionadas);
  };

  const camposGenerales = [
    { label: "Nombre", type: "text", name: "name", value: name, onChange: (e) => setName(e.target.value) },
    { label: "Apellido", type: "text", name: "lastname", value: lastname, onChange: (e) => setLastname(e.target.value) },
    { label: "Email", type: "email", name: "email", value: email, onChange: (e) => setEmail(e.target.value) },
    { label: "DNI", type: "text", name: "dni", value: dni, onChange: (e) => setDni(e.target.value) },
    { label: "Matrícula", type: "text", name: "licenseNumber", value: licenseNumber, onChange: (e) => setLicenseNumber(e.target.value) },
    {
      label: "Especialidades",
      type: "select",
      name: "specialties",
      value: specialtiesSeleccionadas,
      onChange: handleChangeEspecialidades,
      opciones: especialidadesDisponibles.map((esp) => ({
        value: esp.id,
        label: esp.name,
      })),
      multiple: true,
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMensaje("");

    const token = localStorage.getItem("token");

    try {
      //actualiza la info del user
      if (doctorData.User?.id) {
        await apiRequest(
          `/api/users/${doctorData.User.id}`,
          "PUT",
          {
            name,
            lastname,
            email,
            dni,
          },
          token
        );
      }
      //actualiza info de doctors
      await apiRequest(
        `/api/doctors/${id}`,
        "PUT",
        {
          license_number: licenseNumber,
        },
        token
      );

      //trae info de doctor-specialties y luego filtra para quedarse con las que corresponda con el ID del doc
      const originalSpecialtiesIds = specialtiesActuales.map((s) => s.id);

      //para comprobar si se tiene que eliminar una especialidad y/o agregar una nueva
      const especialidadesAEliminar = originalSpecialtiesIds.filter((specialtyId) => !specialtiesSeleccionadas.includes(specialtyId));
      const especialidadesANuevas = specialtiesSeleccionadas.filter((specialtyId) => !originalSpecialtiesIds.includes(specialtyId));

      //se elimina especialidad actual del medico que no queda seleccionada
      for (const espId of especialidadesAEliminar) {
        try {
          await apiRequest(`/api/doctor-specialties/${id}/${espId}`, "DELETE", null, token);
        } catch (err) {
          console.warn("Error al eliminar especialidad:", espId, err);
        }
      }
      //se agrega nueva especialidad seleccionada
      for (const espId of especialidadesANuevas) {
        await apiRequest(
          "/api/doctor-specialties",
          "POST",
          {
            doctor_id: id,
            specialty_id: espId,
          },
          token
        );
      }

      const horariosAEliminar = originalHorariosMedico.filter((originalHorario) => !horariosMedico.some((currentHorario) => currentHorario.id === originalHorario.id));

      const horariosANuevos = horariosMedico.filter((currentHorario) => !originalHorariosMedico.some((originalHorario) => originalHorario.id === currentHorario.id));

      for (const horario of horariosAEliminar) {
        try {
          await apiRequest(`/api/availability/${horario.id}`, "DELETE", null, token);
        } catch (err) {
          console.warn("Error al eliminar horario:", horario.id, err);
        }
      }

      for (const horario of horariosANuevos) {
        await apiRequest(
          `/api/doctors/${id}/availability`,
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

      setMensaje("Médico y horarios actualizados exitosamente.");
      setTimeout(() => {
        navigate("/medicos");
      }, 2000);
    } catch (error) {
      console.error("Error al actualizar médico o sus horarios:", error);
      setMensaje(error.message || "Error al actualizar médico o sus horarios.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <PageAdmin>
        <div className="container mt-4">
          <p>Cargando datos del médico...</p>
        </div>
      </PageAdmin>
    );
  }

  if (!doctorData) {
    return (
      <PageAdmin>
        <div className="container mt-4">
          <p>No se pudieron cargar los datos del médico.</p>
          <button className="btn btn-secondary" onClick={() => navigate("/medicos")}>
            Volver
          </button>
        </div>
      </PageAdmin>
    );
  }

  const espMed = specialtiesActuales.length ? specialtiesActuales.map((s) => s.label || s.name).join(", ") : "Sin especialidad";

  return (
    <PageAdmin>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Editar Médico</h2>
          <button className="btn btn-secondary" onClick={() => navigate("/medicos")}>
            Volver
          </button>
        </div>
        <p>Especialidades Actuales: {espMed}</p>
        <FormGenerico
          titulo={`Editando: ${name} ${lastname}`}
          campos={camposGenerales}
          onSubmit={handleSubmit}
          disabled={isLoading}
          botonTexto="Actualizar Médico"
        />

        <div className={`${formStyles.container} mt-4`}>
          <h2 style={{ marginBottom: "1rem" }}>Editar Horarios de Atención</h2>
          <div className={formStyles.form}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Día de la Semana</label>
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
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Hora de Inicio</label>
              <input
                type="time"
                name="currentStartTime"
                value={currentStartTime}
                onChange={(e) => setCurrentStartTime(e.target.value)}
                className={formStyles.input}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Hora de Fin</label>
              <input
                type="time"
                name="currentEndTime"
                value={currentEndTime}
                onChange={(e) => setCurrentEndTime(e.target.value)}
                className={formStyles.input}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Duración del Turno (minutos)</label>
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
              <h5 style={{ marginBottom: "1rem" }}>Horarios Agregados:</h5>
              <ul className="list-group">
                {horariosMedico.map((horario) => (
                  <li key={horario.id} className="list-group-item d-flex justify-content-between align-items-center">
                    {diasDeSemana.find((d) => parseInt(d.value) === horario.weekday)?.label} de {horario.start_time} a {horario.end_time} (Turnos de {horario.slot_duration_min} min)
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveHorario(horario.id)}
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {isLoading && <p className="mt-3">Actualizando médico y horarios, por favor espere...</p>}
        {mensaje && (
          <div className={`alert mt-3 ${mensaje.includes("exitosamente") ? "alert-success" : "alert-danger"}`}>
            {mensaje}
          </div>
        )}
      </div>
    </PageAdmin>
  );
}