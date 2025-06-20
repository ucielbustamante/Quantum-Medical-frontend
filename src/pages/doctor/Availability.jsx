import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Filter,
  RefreshCw,
  Save,
  Search,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const Availability = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    limit: 10,
    offset: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const queryClient = useQueryClient();

  const { data: availabilityData, isLoading, error } = useQuery(
    ['doctor-availability', user?.id],
    async () => {
      if (!user?.id) {
        return { data: [] };
      }
      
      try {
        const doctorResponse = await api.post('/api/doctors/search', { 
          email: user.email,
          limit: 1 
        });
        
        if (doctorResponse.data.data && doctorResponse.data.data.length > 0) {
          const doctorId = doctorResponse.data.data[0].id;
          const response = await api.get(`/api/doctors/${doctorId}/availability`);
          return response.data;
        } else {
          console.warn('Doctor not found for user:', user.email);
          return { data: [] };
        }
      } catch (error) {
        console.error('Error getting doctor availability:', error);
        return { data: [] };
      }
    },
    { 
      enabled: !!user?.email,
      retry: 3,
      retryDelay: 1000
    }
  );

  const createAvailabilityMutation = useMutation(
    async (availabilityData) => {
      const doctorResponse = await api.post('/api/doctors/search', { 
        email: user.email,
        limit: 1 
      });
      
      if (doctorResponse.data.data && doctorResponse.data.data.length > 0) {
        const doctorId = doctorResponse.data.data[0].id;
        const response = await api.post(`/api/doctors/${doctorId}/availability`, availabilityData);
        return response.data;
      } else {
        throw new Error('Doctor not found');
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['doctor-availability']);
        toast.success('Disponibilidad creada exitosamente');
        setShowForm(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.data?.message || 'Error al crear disponibilidad');
      },
    }
  );

  const updateAvailabilityMutation = useMutation(
    async ({ id, availabilityData }) => {
      const response = await api.put(`/api/availability/${id}`, availabilityData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['doctor-availability']);
        toast.success('Disponibilidad actualizada exitosamente');
        setShowForm(false);
        setEditingAvailability(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.data?.message || 'Error al actualizar disponibilidad');
      },
    }
  );

  const deleteAvailabilityMutation = useMutation(
    async (availabilityId) => {
      const response = await api.delete(`/api/availability/${availabilityId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['doctor-availability']);
        toast.success('Disponibilidad eliminada exitosamente');
      },
      onError: (error) => {
        toast.error(error.response?.data?.data?.message || 'Error al eliminar disponibilidad');
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

  const handleEdit = (availability) => {
    setEditingAvailability(availability);
    setShowForm(true);
  };

  const handleDelete = (availabilityId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta disponibilidad?')) {
      deleteAvailabilityMutation.mutate(availabilityId);
    }
  };

  const handleFormSubmit = (availabilityData) => {
    if (editingAvailability) {
      updateAvailabilityMutation.mutate({ id: editingAvailability.id, availabilityData });
    } else {
      createAvailabilityMutation.mutate(availabilityData);
    }
  };

  const getDayName = (dayNumber) => {
    const days = [
      'Domingo', 'Lunes', 'Martes', 'Miércoles', 
      'Jueves', 'Viernes', 'Sábado'
    ];
    return days[dayNumber] || 'Desconocido';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  };

  const availability = availabilityData?.data || [];

  const filteredAvailability = React.useMemo(() => {
    return availability.filter(item => {
      if (
        searchParams.day_of_week &&
        item.weekday.toString() !== searchParams.day_of_week
      ) {
        return false;
      }
      if (searchParams.start_time && item.start_time < searchParams.start_time) {
        return false;
      }
      if (searchParams.end_time && item.end_time > searchParams.end_time) {
        return false;
      }
      return true;
    });
  }, [availability, searchParams]);

  if (isLoading) {
    return <LoadingSpinner size="lg" className="mt-8" />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error al cargar disponibilidad: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Disponibilidad</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona tus horarios de atención
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Disponibilidad
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Buscar Disponibilidad</h3>
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
                    day_of_week: '',
                    start_time: '',
                    end_time: '',
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
                  Día de la Semana
                </label>
                <select
                  value={searchParams.day_of_week}
                  onChange={(e) => handleInputChange('day_of_week', e.target.value)}
                  className="input"
                >
                  <option value="">Todos los días</option>
                  <option value="1">Lunes</option>
                  <option value="2">Martes</option>
                  <option value="3">Miércoles</option>
                  <option value="4">Jueves</option>
                  <option value="5">Viernes</option>
                  <option value="6">Sábado</option>
                  <option value="0">Domingo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  value={searchParams.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Hora de Fin
                </label>
                <input
                  type="time"
                  value={searchParams.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
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

      {/* Availability Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Disponibilidad ({filteredAvailability.length || 0})
          </h3>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Día de la Semana
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hora de Inicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hora de Fin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración Slot (min)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAvailability.length > 0 ? (
                  filteredAvailability.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getDayName(item.weekday)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatTime(item.start_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatTime(item.end_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.slot_duration_min}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay horarios de disponibilidad configurados o que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Availability Form Modal */}
      {showForm && (
        <AvailabilityForm
          availability={editingAvailability}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingAvailability(null);
          }}
          isLoading={createAvailabilityMutation.isLoading || updateAvailabilityMutation.isLoading}
        />
      )}
    </div>
  );
};

const AvailabilityForm = ({ availability, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    weekday: '',
    start_time: '',
    end_time: '',
    slot_duration_min: 30,
  });
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (availability) {
      setFormData({
        weekday: availability.weekday || '',
        start_time: availability.start_time || '',
        end_time: availability.end_time || '',
        slot_duration_min: availability.slot_duration_min || 30,
      });
    }
  }, [availability]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.weekday) {
      newErrors.weekday = 'Debe seleccionar un día';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Debe especificar hora de inicio';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'Debe especificar hora de fin';
    }

    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      newErrors.end_time = 'La hora de fin debe ser posterior a la hora de inicio';
    }

    if (!formData.slot_duration_min || formData.slot_duration_min < 1) {
      newErrors.slot_duration_min = 'La duración del turno debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {availability ? 'Editar Disponibilidad' : 'Nueva Disponibilidad'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Día de la Semana *
              </label>
              <select
                value={formData.weekday}
                onChange={(e) => handleInputChange('weekday', parseInt(e.target.value))}
                className={`input ${errors.weekday ? 'border-red-500' : ''}`}
              >
                <option value="">Seleccionar día</option>
                <option value="1">Lunes</option>
                <option value="2">Martes</option>
                <option value="3">Miércoles</option>
                <option value="4">Jueves</option>
                <option value="5">Viernes</option>
                <option value="6">Sábado</option>
                <option value="0">Domingo</option>
              </select>
              {errors.weekday && (
                <p className="mt-1 text-sm text-red-600">{errors.weekday}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Inicio *
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                className={`input ${errors.start_time ? 'border-red-500' : ''}`}
              />
              {errors.start_time && (
                <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Fin *
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
                className={`input ${errors.end_time ? 'border-red-500' : ''}`}
              />
              {errors.end_time && (
                <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración del Turno (minutos) *
              </label>
              <input
                type="number"
                min="1"
                max="480"
                value={formData.slot_duration_min}
                onChange={(e) => handleInputChange('slot_duration_min', parseInt(e.target.value))}
                className={`input ${errors.slot_duration_min ? 'border-red-500' : ''}`}
                placeholder="30"
              />
              {errors.slot_duration_min && (
                <p className="mt-1 text-sm text-red-600">{errors.slot_duration_min}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="btn-outline"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {availability ? 'Actualizando...' : 'Creando...'}
                  </div>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {availability ? 'Actualizar' : 'Crear'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Availability; 