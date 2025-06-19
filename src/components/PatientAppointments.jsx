import React, { useState, useEffect } from 'react';
import { appointmentService } from '../services/appointmentService';

const PatientAppointments = ({ patientId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingAppointmentId, setDeletingAppointmentId] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!patientId) return;

      try {
        setLoading(true);
        setError("");
        
        const response = await appointmentService.getPatientAppointments(patientId);
        setAppointments(response.data || []);
      } catch (err) {
        console.error("Error al obtener citas del paciente", err);
        setError("Error al cargar las citas");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [patientId]);

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta cita? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      setDeletingAppointmentId(appointmentId);
      
      await appointmentService.deleteAppointment(appointmentId);
      
      // Actualizar la lista de citas
      setAppointments(prevAppointments => prevAppointments.filter(appointment => appointment.id !== appointmentId));
      
      alert("Cita eliminada exitosamente");
    } catch (err) {
      console.error("Error al eliminar cita:", err);
      alert("Error al eliminar la cita. Por favor intente nuevamente.");
    } finally {
      setDeletingAppointmentId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f39c12'; // Naranja
      case 'confirmed':
        return '#27ae60'; // Verde
      case 'cancelled':
        return '#e74c3c'; // Rojo
      default:
        return '#95a5a6'; // Gris
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        Cargando citas...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: '#e74c3c',
        color: 'white',
        padding: '12px',
        borderRadius: '4px',
        textAlign: 'center'
      }}>
        {error}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '30px',
        color: '#7f8c8d',
        background: '#f8f9fa',
        borderRadius: '4px',
        border: '1px dashed #ddd'
      }}>
        No tienes citas programadas
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
        Mis Citas ({appointments.length})
      </h3>
      
      <div style={{
        display: 'grid',
        gap: '15px'
      }}>
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              background: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '15px'
            }}>
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                  {appointment.Doctor?.User?.name} {appointment.Doctor?.User?.lastname}
                </h4>
                <p style={{ margin: '5px 0', color: '#7f8c8d' }}>
                  <strong>Fecha:</strong> {formatDate(appointment.date)}
                </p>
                <p style={{ margin: '5px 0', color: '#7f8c8d' }}>
                  <strong>Horario:</strong> {appointment.start_time.slice(0, 5)} - {appointment.end_time.slice(0, 5)}
                </p>
              </div>
              
              <div style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'white',
                background: getStatusColor(appointment.status)
              }}>
                {getStatusText(appointment.status)}
              </div>
            </div>
            
            {appointment.Doctor?.Specialties?.map(spec => spec.name).join(', ') && (
              <div style={{ marginTop: '10px' }}>
                <strong style={{ color: '#34495e' }}>Especialidad:</strong>
                <span style={{ marginLeft: '5px', color: '#7f8c8d' }}>
                  {appointment.Doctor?.Specialties?.map(spec => spec.name).join(', ')}
                </span>
              </div>
            )}

            <div style={{ marginTop: '15px', textAlign: 'right' }}>
              <button
                onClick={() => handleDeleteAppointment(appointment.id)}
                disabled={deletingAppointmentId === appointment.id}
                style={{
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: deletingAppointmentId === appointment.id ? 'not-allowed' : 'pointer',
                  opacity: deletingAppointmentId === appointment.id ? 0.6 : 1,
                  fontSize: '14px'
                }}
              >
                {deletingAppointmentId === appointment.id ? 'Eliminando...' : 'Eliminar Cita'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientAppointments; 
