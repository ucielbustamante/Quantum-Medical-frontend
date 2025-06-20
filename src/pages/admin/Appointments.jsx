import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  RefreshCw,
  Clock,
  User,
  Stethoscope,
  Heart,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AppointmentForm from '../../components/admin/AppointmentForm';

const Appointments = () => {
  const [searchParams, setSearchParams] = useState({
    doctor_id: '',
    patient_id: '',
    status: '',
    date_from: '',
    date_to: '',
    limit: 10,
    offset: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const queryClient = useQueryClient();

  const { data: appointmentsData, isLoading, error } = useQuery(
    ['appointments', searchParams],
    async () => {
      try {
        const response = await api.get('/api/appointments');
        return response.data;
      } catch (error) {
        console.error('Error getting appointments:', error);
        return { data: [] };
      }
    }
  );

  const { data: doctorsData } = useQuery(
    ['doctors'],
    async () => {
      const response = await api.post('/api/doctors/search', { limit: 100 });
      return response.data;
    }
  );

  const { data: patientsData } = useQuery(
    ['patients'],
    async () => {
      const response = await api.post('/api/patients/search', { limit: 100 });
      return response.data;
    }
  );

  const createAppointmentMutation = useMutation(
    async (appointmentData) => {
      try {
        if (!appointmentData.doctor_id) {
          throw new Error('Debe seleccionar un doctor');
        }

        if (!appointmentData.patient_id) {
          throw new Error('Debe seleccionar un paciente');
        }

        if (!appointmentData.date) {
          throw new Error('Debe seleccionar una fecha para la cita');
        }

        if (!appointmentData.start_time) {
          throw new Error('Debe seleccionar una hora de inicio para la cita');
        }

        if (!appointmentData.end_time) {
          throw new Error('Debe seleccionar una hora de fin para la cita');
        }

        try {
          const slotsResponse = await api.get(`/api/doctors/${appointmentData.doctor_id}/available-slots`, {
            params: {
              startDate: appointmentData.date,
              endDate: appointmentData.date,
            }
          });
          
          const availableSlots = slotsResponse.data.data || [];
          const requestedSlot = availableSlots.find(slot => {
            return slot.start_time === appointmentData.start_time && 
                   slot.end_time === appointmentData.end_time && 
                   !slot.patient_id;
          });
          
          if (!requestedSlot) {
            throw new Error('El horario seleccionado no está disponible para este doctor');
          }
        } catch (slotError) {
          console.warn('Error checking available slots:', slotError);
        }

        const response = await api.post('/api/appointments', appointmentData);
        return response.data;
      } catch (error) {
        console.error('Error creating appointment:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['appointments']);
        toast.success('Cita creada exitosamente');
        setShowForm(false);
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.data?.message || error.response?.data?.message || error.message || 'Error al crear cita';
        toast.error(errorMessage);
      },
    }
  );

  const updateStatusMutation = useMutation(
    async ({ id, status }) => {
      const response = await api.patch(`/api/appointments/${id}/status`, { status });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['appointments']);
        toast.success('Estado de cita actualizado exitosamente');
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.data?.message || error.response?.data?.message || 'Error al actualizar estado';
        toast.error(errorMessage);
      },
    }
  );

  const deleteAppointmentMutation = useMutation(
    async (appointmentId) => {
      const response = await api.delete(`/api/appointments/${appointmentId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['appointments']);
        toast.success('Cita eliminada exitosamente');
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.data?.message || error.response?.data?.message || 'Error al eliminar cita';
        toast.error(errorMessage);
      },
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    queryClient.invalidateQueries(['appointments']);
    setSearchParams(prev => ({ ...prev, offset: 0 }));
  };

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const handleDelete = (appointmentId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      deleteAppointmentMutation.mutate(appointmentId);
    }
  };

  const handleStatusChange = (appointmentId, newStatus) => {
    updateStatusMutation.mutate({ id: appointmentId, status: newStatus });
  };

  const handleFormSubmit = (appointmentData) => {
    createAppointmentMutation.mutate(appointmentData);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Confirmada
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="mr-1 h-3 w-3" />
            Pendiente
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelada
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="mr-1 h-3 w-3" />
            {status}
          </span>
        );
    }
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
    // Si es un string de tiempo (HH:MM:SS), solo tomar HH:MM
    if (typeof timeString === 'string' && timeString.includes(':')) {
      return timeString.substring(0, 5);
    }
    return new Date(timeString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="mt-8" />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error al cargar citas: {error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-outline mt-4"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const appointments = appointmentsData?.data || [];

  const filteredAppointments = appointments.filter(appointment => {
    if (searchParams.doctor_id && appointment.doctor_id !== searchParams.doctor_id) {
      return false;
    }

    if (searchParams.patient_id && appointment.patient_id !== searchParams.patient_id) {
      return false;
    }

    if (searchParams.status && appointment.status !== searchParams.status) {
      return false;
    }

    // Filtro por fecha desde
    if (searchParams.date_from) {
      const appointmentDate = new Date(appointment.date);
      const fromDate = new Date(searchParams.date_from);
      if (appointmentDate < fromDate) {
        return false;
      }
    }

    // Filtro por fecha hasta
    if (searchParams.date_to) {
      const appointmentDate = new Date(appointment.date);
      const toDate = new Date(searchParams.date_to);
      if (appointmentDate > toDate) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra las citas del sistema
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cita
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Buscar Citas</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </button>
              <button
                onClick={() => {
                  setSearchParams({
                    doctor_id: '',
                    patient_id: '',
                    status: '',
                    date_from: '',
                    date_to: '',
                    limit: 10,
                    offset: 0,
                  });
                }}
                className="btn-outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Limpiar
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Doctor
                </label>
                <select
                  value={searchParams.doctor_id}
                  onChange={(e) => handleInputChange('doctor_id', e.target.value)}
                  className="input"
                >
                  <option value="">Todos los doctores</option>
                  {doctorsData?.data?.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.User?.name} {doctor.User?.lastname}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Paciente
                </label>
                <select
                  value={searchParams.patient_id}
                  onChange={(e) => handleInputChange('patient_id', e.target.value)}
                  className="input"
                >
                  <option value="">Todos los pacientes</option>
                  {patientsData?.data?.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.User?.name} {patient.User?.lastname}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  value={searchParams.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="input"
                >
                  <option value="">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha Desde
                  </label>
                  <input
                    type="date"
                    value={searchParams.date_from}
                    onChange={(e) => handleInputChange('date_from', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha Hasta
                  </label>
                  <input
                    type="date"
                    value={searchParams.date_to}
                    onChange={(e) => handleInputChange('date_to', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Límite
                  </label>
                  <select
                    value={searchParams.limit}
                    onChange={(e) => handleInputChange('limit', parseInt(e.target.value))}
                    className="input"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button type="submit" className="btn-primary">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Citas ({filteredAppointments.length})
          </h3>
        </div>
        <div className="card-body">
          {filteredAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        {appointment.Patient?.User?.name} {appointment.Patient?.User?.lastname}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Dr. {appointment.Doctor?.User?.name} {appointment.Doctor?.User?.lastname}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Fecha:</span>
                      <span>
                        {(() => {
                          const formattedDate = formatDate(appointment.date);
                          return formattedDate;
                        })()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Hora:</span>
                      <span>
                        {(() => {
                          const startTime = formatTime(appointment.start_time);
                          const endTime = formatTime(appointment.end_time);
                          return `${startTime} - ${endTime}`;
                        })()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Estado:</span>
                      <span>{getStatusBadge(appointment.status)}</span>
                    </div>

                    {appointment.notes && (
                      <div className="text-sm text-gray-600">
                        <p className="truncate">
                          Notas: {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="flex-1 btn-outline text-sm"
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="flex-1 btn-outline text-sm text-red-600 hover:text-red-700"
                      disabled={deleteAppointmentMutation.isLoading}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchParams.doctor_id || searchParams.patient_id || searchParams.status
                  ? 'No se encontraron citas con los criterios especificados.'
                  : 'No hay citas programadas en el sistema.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Form Modal */}
      {showForm && (
        <AppointmentForm
          appointment={editingAppointment}
          doctors={doctorsData?.data || []}
          patients={patientsData?.data || []}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingAppointment(null);
          }}
          isLoading={createAppointmentMutation.isLoading}
        />
      )}
    </div>
  );
};

export default Appointments;