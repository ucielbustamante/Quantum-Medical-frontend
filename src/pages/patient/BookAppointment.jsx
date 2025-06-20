import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Clock,
  User,
  Search,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Stethoscope,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');

  const doctorEmail = doctorId ? decodeURIComponent(doctorId) : null;

  const { data: doctorData, isLoading: doctorLoading, error: doctorError } = useQuery(
    ['doctor', doctorEmail],
    async () => {
      if (!doctorEmail) throw new Error('Email del doctor no proporcionado');

      const response = await api.post('/api/doctors/search', { 
        email: doctorEmail,
        limit: 1 
      });
      
      if (!response.data.data || response.data.data.length === 0) {
        throw new Error('Doctor no encontrado');
      }
      
      return response.data;
    },
    {
      enabled: !!doctorEmail,
      onError: (error) => {
        console.error('Error fetching doctor:', error);
        toast.error('Error al cargar información del doctor');
      }
    }
  );

  const doctor = doctorData?.data?.[0];
  const actualDoctorId = doctor?.id;

  const { data: slotsData, isLoading: slotsLoading } = useQuery(
    ['doctor-slots', actualDoctorId, selectedDate],
    async () => {
      if (!selectedDate || !actualDoctorId) return { data: { slots: [] } };
      
      const startDate = new Date(selectedDate);
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 7);
      
      const response = await api.get(`/api/doctors/${actualDoctorId}/available-slots`, {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        }
      });
      return response.data;
    },
    {
      enabled: !!actualDoctorId && !!selectedDate,
      onError: (error) => {
        console.error('Error fetching available slots:', error);
        toast.error('Error al cargar horarios disponibles');
      }
    }
  );

  const createAppointmentMutation = useMutation(
    async (appointmentData) => {
      if (!selectedSlot) {
        throw new Error('No se ha seleccionado un horario válido');
      }

      if (selectedSlot.patient_id) {
        throw new Error('El horario seleccionado ya no está disponible');
      }

      const response = await api.post('/api/appointments', appointmentData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['patient-appointments']);
        toast.success('Cita agendada exitosamente');
        navigate('/patient/appointments');
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.data?.message || error.message || 'Error al agendar cita';
        toast.error(errorMessage);
      },
    }
  );

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedSlot) {
      toast.error('Por favor selecciona un horario');
      return;
    }

    const localDate = new Date(selectedSlot.date + 'T00:00:00');

    const appointmentData = {
      doctor_id: actualDoctorId,
      date: localDate,
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
      notes: notes,
    };

    createAppointmentMutation.mutate(appointmentData);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      timeZone: 'UTC',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    if (typeof timeString === 'string' && timeString.includes(':')) {
      return timeString.substring(0, 5);
    }
    return new Date(timeString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSlotTime = (startTime, endTime) => {
    const start = formatTime(startTime);
    const end = formatTime(endTime);
    return `${start} - ${end}`;
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      dates.push(`${year}-${month}-${day}`);
    }
    
    return dates;
  };

  if (doctorLoading) {
    return <LoadingSpinner size="lg" className="mt-8" />;
  }

  if (doctorError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error al cargar información del doctor</p>
        <button 
          onClick={() => navigate('/patient/doctors')}
          className="btn-outline mt-4"
        >
          Volver a la lista de doctores
        </button>
      </div>
    );
  }

  const slots = slotsData?.data || [];

  if (!doctor) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Doctor no encontrado</p>
        <button 
          onClick={() => navigate('/patient/doctors')}
          className="btn-outline mt-4"
        >
          Volver a la lista de doctores
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/patient/doctors')}
          className="btn-outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendar Cita</h1>
          <p className="mt-1 text-sm text-gray-500">
            Programa tu cita médica
          </p>
        </div>
      </div>

      {/* Doctor Info */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Información del Doctor</h3>
        </div>
        <div className="card-body">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-medium text-gray-900">
                Dr. {doctor.User?.name} {doctor.User?.lastname}
              </h4>
              <p className="text-sm text-gray-500">{doctor.User?.email}</p>
              
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                {doctor.User?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    <span>{doctor.User.phone}</span>
                  </div>
                )}
                {doctor.User?.address && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{doctor.User.address}</span>
                  </div>
                )}
              </div>

              {doctor.Specialties && doctor.Specialties.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Stethoscope className="h-4 w-4 mr-1" />
                    <span>Especialidades:</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {doctor.Specialties.map((specialty) => (
                      <span
                        key={specialty.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {specialty.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Form */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Seleccionar Fecha y Hora</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Fecha
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {getAvailableDates().map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => handleDateChange(date)}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      selectedDate === date
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">
                      {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-xs opacity-75">
                      {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short' })}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horarios Disponibles - {formatDate(selectedDate)}
                </label>
                {slotsLoading ? (
                  <LoadingSpinner size="sm" />
                ) : slots.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleSlotSelect(slot)}
                        disabled={slot.patient_id} // Deshabilitar si ya tiene paciente
                        className={`p-3 text-sm rounded-lg border transition-colors ${
                          slot.patient_id
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : selectedSlot?.id === slot.id
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">
                          {formatSlotTime(slot.start_time, slot.end_time)}
                        </div>
                        <div className="text-xs opacity-75">
                          {slot.patient_id ? 'Ocupado' : 'Disponible'}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay horarios disponibles</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No hay horarios disponibles para esta fecha.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="input"
                placeholder="Agrega cualquier información adicional o motivo de la consulta..."
              />
            </div>

            {/* Summary */}
            {selectedSlot && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Resumen de la Cita</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Doctor:</span>
                    <span>Dr. {doctor.User?.name} {doctor.User?.lastname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fecha:</span>
                      <span>{formatDate(selectedSlot.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hora:</span>
                    <span>{formatSlotTime(selectedSlot.start_time, selectedSlot.end_time)}</span>
                  </div>
                  {notes && (
                    <div className="flex justify-between">
                      <span>Notas:</span>
                      <span className="text-right max-w-xs truncate">{notes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/patient/doctors')}
                className="btn-outline"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!selectedSlot || createAppointmentMutation.isLoading}
                className="btn-primary"
              >
                {createAppointmentMutation.isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirmar Cita
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Instrucciones</h3>
        </div>
        <div className="card-body">
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <Calendar className="h-4 w-4 mt-0.5 text-blue-600" />
              <span>Selecciona una fecha disponible para tu cita.</span>
            </div>
            <div className="flex items-start space-x-2">
              <Clock className="h-4 w-4 mt-0.5 text-green-600" />
              <span>Elige un horario que se ajuste a tu disponibilidad.</span>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-600" />
              <span>Llega 10 minutos antes de tu cita programada.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-purple-600" />
              <span>Recibirás una confirmación por email una vez agendada la cita.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment; 