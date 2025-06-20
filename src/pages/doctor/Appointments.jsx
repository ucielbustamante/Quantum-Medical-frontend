import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const Appointments = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    status: '',
    date: '',
    patient_name: '',
    limit: 10,
    offset: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const queryClient = useQueryClient();

  const { data: appointmentsData, isLoading, error } = useQuery(
    ['doctor-appointments', user?.id],
    async () => {
      if (!user?.id) return { data: [] };
      try {
        const doctorResponse = await api.post('/api/doctors/search', { 
          email: user.email,
          limit: 1 
        });
        
        if (doctorResponse.data.data && doctorResponse.data.data.length > 0) {
          const doctorId = doctorResponse.data.data[0].id;
          const response = await api.get(`/api/doctors/${doctorId}/appointments`);
          return response.data;
        } else {
          console.warn('Doctor not found for user:', user.email);
          return { data: [] };
        }
      } catch (error) {
        console.error('Error getting doctor appointments:', error);
        return { data: [] };
      }
    },
    { enabled: !!user?.id }
  );

  const updateAppointmentMutation = useMutation(
    async ({ appointmentId, status }) => {
      const response = await api.patch(`/api/appointments/${appointmentId}/status`, { status });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['doctor-appointments']);
        toast.success('Estado de cita actualizado exitosamente');
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.data?.message || error.response?.data?.message || 'Error al actualizar cita';
        toast.error(errorMessage);
      },
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(prev => ({ ...prev, offset: 0 }));
  };

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  const handleStatusUpdate = (appointmentId, newStatus) => {
    if (window.confirm(`¿Estás seguro de que quieres cambiar el estado a "${newStatus}"?`)) {
      updateAppointmentMutation.mutate({ appointmentId, status: newStatus });
    }
  };

  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const appointments = appointmentsData?.data || [];

  const filteredAppointments = Array.isArray(appointments) ? appointments.filter(appointment => {
    if (!appointment.patient_id || !appointment.Patient) {
        return false;
    }

    if (searchParams.status && appointment.status !== searchParams.status) return false;
    if (searchParams.date) {
      const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
      if (appointmentDate !== searchParams.date) return false;
    }
    if (searchParams.patient_name) {
      const patientName = `${appointment.Patient?.User?.name || ''} ${appointment.Patient?.User?.lastname || ''}`.toLowerCase();
      if (!patientName.includes(searchParams.patient_name.toLowerCase())) return false;
    }
    return true;
  }) : [];

  if (isLoading) {
    return <LoadingSpinner size="lg" className="mt-8" />;
  }

  if (error && error.response?.status === 403) {
    return (
      <div className="text-center py-8">
        <div className="max-w-md mx-auto">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error de Autorización</h3>
          <p className="text-sm text-gray-600 mb-4">
            No tienes permisos para acceder a las citas. Verifica que tu cuenta tenga el rol de doctor correcto.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Citas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona tus citas médicas
          </p>
        </div>
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
                    status: '',
                    date: '',
                    patient_name: '',
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha
                </label>
                <input
                  type="date"
                  value={searchParams.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del Paciente
                </label>
                <input
                  type="text"
                  value={searchParams.patient_name}
                  onChange={(e) => handleInputChange('patient_name', e.target.value)}
                  className="input"
                  placeholder="Buscar por nombre"
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
                        {(() => {
                          const formattedDate = formatDate(appointment.date);
                          return formattedDate;
                        })()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Hora:</span>
                      <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Estado:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="ml-1">{getStatusText(appointment.status)}</span>
                      </span>
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
                      onClick={() => handleView(appointment)}
                      className="flex-1 btn-outline text-sm"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Ver
                    </button>
                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                        className="flex-1 btn-primary text-sm"
                        disabled={updateAppointmentMutation.isLoading}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Confirmar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchParams.status || searchParams.date || searchParams.patient_name
                  ? 'No se encontraron citas con los criterios especificados.'
                  : 'No tienes citas programadas.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles de la Cita
                </h3>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Patient Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Información del Paciente</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedAppointment.Patient?.User?.name} {selectedAppointment.Patient?.User?.lastname}
                        </p>
                        <p className="text-sm text-gray-500">{selectedAppointment.Patient?.User?.email}</p>
                      </div>
                    </div>
                    {selectedAppointment.Patient?.User?.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{selectedAppointment.Patient.User.phone}</span>
                      </div>
                    )}
                    {selectedAppointment.Patient?.User?.address && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{selectedAppointment.Patient.User.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Información de la Cita</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(selectedAppointment.date)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hora</label>
                        <p className="mt-1 text-sm text-gray-900">{formatTime(selectedAppointment.start_time)} - {formatTime(selectedAppointment.end_time)}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                          {getStatusIcon(selectedAppointment.status)}
                          <span className="ml-1">{getStatusText(selectedAppointment.status)}</span>
                        </span>
                      </div>
                    </div>
                    {selectedAppointment.notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Notas</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedAppointment.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  {selectedAppointment.status === 'pending' && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedAppointment.id, 'confirmed');
                        setSelectedAppointment(null);
                      }}
                      className="btn-primary"
                      disabled={updateAppointmentMutation.isLoading}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirmar Cita
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="btn-outline"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments; 