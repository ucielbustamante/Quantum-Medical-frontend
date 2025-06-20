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
  Eye,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const Appointments = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    status: '',
    date: '',
    limit: 10,
    offset: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const queryClient = useQueryClient();

  const { data: profileData, isLoading: profileLoading } = useQuery(
    ['patient-profile'],
    async () => {
      const response = await api.get('/api/rbac/patient/profile');
      return response.data;
    }
  );

  const { data: appointmentsData, isLoading: appointmentsLoading, error } = useQuery(
    ['patient-appointments', profileData?.data?.user?.patient?.id],
    async () => {
      if (!profileData?.data?.user?.patient?.id) {
        throw new Error('Patient ID not available');
      }
      const response = await api.get(`/api/patients/${profileData.data.user.patient.id}/appointments`);
      return response.data;
    },
    { enabled: !!profileData?.data?.user?.patient?.id }
  );

  const cancelAppointmentMutation = useMutation(
    async (appointmentId) => {
      const response = await api.patch(`/api/appointments/${appointmentId}/status`, { status: 'cancelled' });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['patient-appointments']);
        toast.success('Cita cancelada exitosamente');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al cancelar cita');
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

  const handleCancel = (appointmentId) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      cancelAppointmentMutation.mutate(appointmentId);
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

  if (profileLoading || appointmentsLoading) {
    return <LoadingSpinner size="lg" className="mt-8" />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error al cargar citas: {error.message}</p>
        <p className="text-sm text-gray-500 mt-2">
          {error.message === 'Patient ID not available' 
            ? 'No se pudo obtener la información del paciente. Intente recargar la página.'
            : 'Verifique su conexión e intente nuevamente.'
          }
        </p>
      </div>
    );
  }

  if (!profileData?.data?.user?.patient?.id) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">No se encontró información del paciente</p>
        <p className="text-sm text-gray-500 mt-2">
          Contacte al administrador para verificar su cuenta.
        </p>
      </div>
    );
  }

  const appointments = appointmentsData?.data || [];

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
        <a
          href="/patient/doctors"
          className="btn-primary"
        >
          <User className="mr-2 h-4 w-4" />
          Agendar Nueva Cita
        </a>
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

      {/* Appointments Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Citas ({appointments.length})
          </h3>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            Dr. {appointment.Doctor?.User?.name} {appointment.Doctor?.User?.lastname}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.Doctor?.User?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(() => {
                          const formattedDate = formatDate(appointment.date);
                          return formattedDate;
                        })()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.Doctor?.Specialties?.[0]?.name || 'Sin especialidad'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="ml-1">{getStatusText(appointment.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(appointment)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {appointment.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(appointment.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={cancelAppointmentMutation.isLoading}
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {appointments.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron citas con los criterios de búsqueda especificados.
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
                {/* Doctor Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Información del Doctor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Nombre:</span>
                      <span className="ml-2 text-gray-900">
                        Dr. {selectedAppointment.Doctor?.User?.name} {selectedAppointment.Doctor?.User?.lastname}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="ml-2 text-gray-900">{selectedAppointment.Doctor?.User?.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Especialidad:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedAppointment.Doctor?.Specialties?.[0]?.name || 'Sin especialidad'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Licencia:</span>
                      <span className="ml-2 text-gray-900">{selectedAppointment.Doctor?.license_number || 'No disponible'}</span>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Detalles de la Cita</h4>
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
                      <p className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                          {getStatusIcon(selectedAppointment.status)}
                          <span className="ml-1">{getStatusText(selectedAppointment.status)}</span>
                        </span>
                      </p>
                    </div>
                    {selectedAppointment.notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Notas</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedAppointment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  {selectedAppointment.status === 'pending' && (
                    <button
                      onClick={() => {
                        handleCancel(selectedAppointment.id);
                        setSelectedAppointment(null);
                      }}
                      className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancelar Cita
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