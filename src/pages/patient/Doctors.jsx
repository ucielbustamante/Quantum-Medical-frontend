import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Stethoscope,
  Clock,
  Eye,
  Star,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Doctors = () => {
  const [searchParams, setSearchParams] = useState({
    name: '',
    specialty_id: '',
    limit: 10,
    offset: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const { data: doctorsData, isLoading, error } = useQuery(
    ['doctors', searchParams],
    async () => {
      try {
        const validParams = {};
        if (searchParams.name) validParams.name = searchParams.name;
        if (searchParams.specialty_id) validParams.specialties = [parseInt(searchParams.specialty_id)];
        if (searchParams.limit) validParams.limit = searchParams.limit;
        if (searchParams.offset) validParams.offset = searchParams.offset;

        const response = await api.post('/api/doctors/search', validParams);
        return response.data;
      } catch (error) {
        console.error('Error searching doctors:', error);
        if (error.response?.status === 400) {
          throw new Error('Parámetros de búsqueda inválidos. Verifique los datos ingresados.');
        }
        throw new Error('Error al buscar doctores. Verifique su conexión e intente nuevamente.');
      }
    }
  );

  const { data: specialtiesData } = useQuery(
    ['specialties'],
    async () => {
      try {
        const response = await api.get('/api/specialties');
        return response.data;
      } catch (error) {
        console.warn('Error getting specialties:', error);
        return { data: { specialties: [] } };
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(prev => ({ ...prev, offset: 0 }));
  };

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  const handleView = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleBookAppointment = (doctor) => {
    const doctorEmail = doctor.User?.email;
    if (doctorEmail) {
      window.location.href = `/patient/book-appointment/${encodeURIComponent(doctorEmail)}`;
    } else {
      toast.error('No se pudo obtener la información del doctor');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="mt-8" />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error al cargar doctores: {error.message}</p>
      </div>
    );
  }

  const doctors = doctorsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buscar Doctores</h1>
          <p className="mt-1 text-sm text-gray-500">
            Encuentra y agenda citas con especialistas
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Buscar Doctores</h3>
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
                    name: '',
                    specialty_id: '',
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
                  Nombre del Doctor
                </label>
                <input
                  type="text"
                  value={searchParams.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
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

      {/* Doctors Grid */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Doctores ({doctors.length})
          </h3>
        </div>
        <div className="card-body">
          {doctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserCheck className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        Dr. {doctor.User?.name} {doctor.User?.lastname}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {doctor.Specialties?.[0]?.name || 'Sin especialidad'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="truncate">{doctor.User?.email}</span>
                    </div>
                    
                    {doctor.User?.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{doctor.User.phone}</span>
                      </div>
                    )}
                    
                    {doctor.User?.address && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">{doctor.User.address}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Licencia:</span>
                      <span>{doctor.license_number || 'No disponible'}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Especialidades:</span>
                      <span>{doctor.Specialties?.length || 0}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleView(doctor)}
                      className="flex-1 btn-outline text-sm"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Ver Detalles
                    </button>
                    <button
                      onClick={() => handleBookAppointment(doctor)}
                      className="flex-1 btn-primary text-sm"
                    >
                      <Calendar className="mr-1 h-4 w-4" />
                      Agendar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay doctores</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron doctores con los criterios de búsqueda especificados.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles del Doctor
                </h3>
                <button
                  onClick={() => setSelectedDoctor(null)}
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
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Información Personal</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Nombre:</span>
                      <span className="ml-2 text-gray-900">
                        Dr. {selectedDoctor.User?.name} {selectedDoctor.User?.lastname}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="ml-2 text-gray-900">{selectedDoctor.User?.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Teléfono:</span>
                      <span className="ml-2 text-gray-900">{selectedDoctor.User?.phone || 'No disponible'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Dirección:</span>
                      <span className="ml-2 text-gray-900">{selectedDoctor.User?.address || 'No disponible'}</span>
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Información Profesional</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Licencia</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedDoctor.license_number || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">DNI</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedDoctor.User?.dni || 'No disponible'}</p>
                      </div>
                    </div>
                    
                    {selectedDoctor.Specialties && selectedDoctor.Specialties.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Especialidades</label>
                        <div className="mt-2 space-y-2">
                          {selectedDoctor.Specialties.map((specialty) => (
                            <div key={specialty.id} className="flex items-center space-x-2">
                              <Stethoscope className="h-4 w-4 text-blue-500" />
                              <span className="text-sm text-gray-900">{specialty.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleBookAppointment(selectedDoctor)}
                    className="btn-primary"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar Cita
                  </button>
                  <button
                    onClick={() => setSelectedDoctor(null)}
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

export default Doctors; 