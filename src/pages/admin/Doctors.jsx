import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  Stethoscope,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  RefreshCw,
  Calendar,
  User,
  Briefcase,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DoctorForm from '../../components/admin/DoctorForm';
import ManageSpecialtiesModal from '../../components/admin/ManageSpecialtiesModal';

const Doctors = () => {
  const [searchParams, setSearchParams] = useState({
    name: '',
    lastname: '',
    email: '',
    dni: '',
    license_number: '',
    specialties: [],
    limit: 10,
    offset: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSpecialtiesModal, setShowSpecialtiesModal] = useState(false);
  const [managingDoctor, setManagingDoctor] = useState(null);

  const queryClient = useQueryClient();

  const { data: doctorsData, isLoading, error } = useQuery(
    ['doctors', searchParams],
    async () => {
      const response = await api.post('/api/doctors/search', searchParams);
      return response.data;
    }
  );

  const { data: specialtiesData } = useQuery(
    ['specialties'],
    async () => {
      const response = await api.get('/api/specialties');
      return response.data;
    }
  );

  const createDoctorMutation = useMutation(
    async (doctorData) => {
      try {
        const userData = {
          name: doctorData.name,
          lastname: doctorData.lastname,
          email: doctorData.email,
          password: doctorData.password,
          role: 'Doctor',
          dni: doctorData.dni,
        };
        
        const userResponse = await api.post('/api/auth/register', userData);
        const userId = userResponse.data.data.id;
        
        const doctorSearchResponse = await api.post('/api/doctors/search', { 
          email: doctorData.email,
          limit: 1 
        });
        
        if (doctorSearchResponse.data.data && doctorSearchResponse.data.data.length > 0) {
          const doctorId = doctorSearchResponse.data.data[0].id;
          
          const doctorResponse = await api.put(`/api/doctors/${doctorId}`, {
            license_number: doctorData.license_number
          });
          
          return doctorResponse.data;
        } else {
          throw new Error('No se pudo encontrar el doctor recién creado');
        }
      } catch (error) {
        console.error('Error creating doctor:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['doctors']);
        toast.success('Doctor creado exitosamente');
        setShowForm(false);
        setEditingDoctor(null);
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.data?.message || error.response?.data?.message || error.message || 'Error al crear doctor';
        toast.error(errorMessage);
      },
    }
  );

  const updateDoctorMutation = useMutation(
    async ({ id, doctorData }) => {
      try {
        const response = await api.put(`/api/doctors/${id}`, doctorData);
        return response.data;
      } catch (error) {
        console.error('Error updating doctor:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['doctors']);
        toast.success('Doctor actualizado exitosamente');
        setShowForm(false);
        setEditingDoctor(null);
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.data?.message || error.response?.data?.message || error.message || 'Error al actualizar doctor';
        toast.error(errorMessage);
      },
    }
  );

  const deleteDoctorMutation = useMutation(
    async (doctorId) => {
      const response = await api.delete(`/api/doctors/${doctorId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['doctors']);
        toast.success('Doctor eliminado exitosamente');
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.data?.message || error.response?.data?.message || 'Error al eliminar doctor';
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

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setShowForm(true);
  };

  const handleDelete = (doctorId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este doctor?')) {
      deleteDoctorMutation.mutate(doctorId);
    }
  };

  const handleFormSubmit = (doctorData) => {
    if (editingDoctor) {
      updateDoctorMutation.mutate({ id: editingDoctor.id, doctorData });
    } else {
      createDoctorMutation.mutate(doctorData);
    }
  };

  const handleManageSpecialties = (doctor) => {
    setManagingDoctor(doctor);
    setShowSpecialtiesModal(true);
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Activo
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactivo
      </span>
    );
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="mt-8" />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error al cargar doctores: {error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-outline mt-4"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const doctors = doctorsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Doctores</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra los doctores del sistema
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Doctor
        </button>
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
                    lastname: '',
                    email: '',
                    dni: '',
                    license_number: '',
                    specialties: [],
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
                  Nombre
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
                  Apellido
                </label>
                <input
                  type="text"
                  value={searchParams.lastname}
                  onChange={(e) => handleInputChange('lastname', e.target.value)}
                  className="input"
                  placeholder="Buscar por apellido"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={searchParams.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input"
                  placeholder="Buscar por email"
                />
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    DNI
                  </label>
                  <input
                    type="text"
                    value={searchParams.dni}
                    onChange={(e) => handleInputChange('dni', e.target.value)}
                    className="input"
                    placeholder="Buscar por DNI"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Número de Licencia
                  </label>
                  <input
                    type="text"
                    value={searchParams.license_number}
                    onChange={(e) => handleInputChange('license_number', e.target.value)}
                    className="input"
                    placeholder="Buscar por licencia"
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
                        <Stethoscope className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        Dr. {doctor.User?.name} {doctor.User?.lastname}
                      </h4>
                      <p className="text-sm text-gray-500">{doctor.User?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Licencia:</span>
                      <span>{doctor.license_number || 'No especificada'}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>DNI:</span>
                      <span>{doctor.User?.dni || 'No especificado'}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Estado:</span>
                      <span>{getStatusBadge(doctor.User?.is_active)}</span>
                    </div>

                    {doctor.Specialties && doctor.Specialties.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <span>Especialidades:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {doctor.Specialties.map((specialty) => (
                            <span
                              key={specialty.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {specialty.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleEdit(doctor)}
                      className="flex-1 btn-outline text-sm"
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleManageSpecialties(doctor)}
                      className="flex-1 btn-outline text-sm"
                    >
                      <Briefcase className="mr-1 h-4 w-4" />
                      Especialidades
                    </button>
                    <button
                      onClick={() => handleDelete(doctor.id)}
                      className="flex-1 btn-outline text-sm text-red-600 hover:text-red-700"
                      disabled={deleteDoctorMutation.isLoading}
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
              <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay doctores</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchParams.name || searchParams.lastname || searchParams.email
                  ? 'No se encontraron doctores con los criterios especificados.'
                  : 'No hay doctores registrados en el sistema.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Doctor Form Modal */}
      {showForm && (
        <DoctorForm
          doctor={editingDoctor}
          specialties={specialtiesData?.data || []}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingDoctor(null);
          }}
          isLoading={createDoctorMutation.isLoading || updateDoctorMutation.isLoading}
        />
      )}

      {showSpecialtiesModal && managingDoctor && (
        <ManageSpecialtiesModal
          doctor={managingDoctor}
          onClose={() => {
            setShowSpecialtiesModal(false);
            setManagingDoctor(null);
          }}
        />
      )}
    </div>
  );
};

export default Doctors; 