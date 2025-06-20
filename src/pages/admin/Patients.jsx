import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  RefreshCw,
  Calendar,
  Heart,
  CreditCard,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PatientForm from '../../components/admin/PatientForm';
import UserForm from '../../components/admin/UserForm';

const Patients = () => {
  const [searchParams, setSearchParams] = useState({
    name: '',
    lastname: '',
    email: '',
    dni: '',
    limit: 10,
    offset: 0,
  });
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [newlyCreatedUser, setNewlyCreatedUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const queryClient = useQueryClient();

  const { data: patientsData, isLoading, error } = useQuery(
    ['patients', searchParams],
    async () => {
      const response = await api.post('/api/patients/search', searchParams);
      return response.data;
    }
  );

  const createUserMutation = useMutation(
    async (userData) => {
      const response = await api.post('/api/users', userData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        const createdUser = data.data.user;
        if (createdUser && createdUser.role === 'Patient') {
          api.post('/api/patients/search', { 
            email: createdUser.email,
            limit: 1 
          }).then(response => {
            const patient = response.data.data[0];
            if (patient) {
              setNewlyCreatedUser({ ...createdUser, patient });
              setShowUserForm(false);
              setShowPatientForm(true);
              toast.success('Usuario creado exitosamente. Ahora complete los datos del paciente.');
            } else {
              toast.error('Error: No se pudo encontrar el paciente creado');
            }
          }).catch(error => {
            console.error('Error finding created patient:', error);
            toast.error('Error al buscar el paciente creado');
          });
        } else {
          toast.error('Error: El usuario no se creó como paciente');
        }
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al crear usuario');
      },
    }
  );

  const updatePatientMutation = useMutation(
    async ({ id, patientData }) => {
      const response = await api.put(`/api/patients/${id}`, patientData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['patients']);
        toast.success('Paciente actualizado exitosamente');
        setShowPatientForm(false);
        setEditingPatient(null);
        setNewlyCreatedUser(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al actualizar paciente');
      },
    }
  );

  const deletePatientMutation = useMutation(
    async (patientId) => {
      const response = await api.delete(`/api/patients/${patientId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['patients']);
        toast.success('Paciente eliminado exitosamente');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al eliminar paciente');
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

  const handleCreateNew = () => {
    setShowUserForm(true);
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setShowPatientForm(true);
  };

  const handleDelete = (patientId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
      deletePatientMutation.mutate(patientId);
    }
  };

  const handleUserFormSubmit = (userData) => {
    userData.role = 'Patient';
    createUserMutation.mutate(userData);
  };

  const handlePatientFormSubmit = (patientData) => {
    if (editingPatient) {
      updatePatientMutation.mutate({ id: editingPatient.id, patientData });
    } else if (newlyCreatedUser) {
      updatePatientMutation.mutate({ id: newlyCreatedUser.patient.id, patientData });
    }
  };

  const handleCancelUserForm = () => {
    setShowUserForm(false);
  };

  const handleCancelPatientForm = () => {
    setShowPatientForm(false);
    setEditingPatient(null);
    setNewlyCreatedUser(null);
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
        <p className="text-red-600">Error al cargar pacientes: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Pacientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra los pacientes del sistema
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Paciente
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Buscar Pacientes</h3>
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

      {/* Patients Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Pacientes ({patientsData?.data?.length || 0})
          </h3>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Nacimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Obra Social
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número de Obra Social
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
                {patientsData?.data?.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Heart className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.User?.name} {patient.User?.lastname}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.User?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.User?.dni || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(patient.birthday)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.health_insurance || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.health_insurance_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(patient.User?.is_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(patient)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={deletePatientMutation.isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {patientsData?.data?.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pacientes</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron pacientes con los criterios de búsqueda especificados.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          onSubmit={handleUserFormSubmit}
          onCancel={handleCancelUserForm}
          isLoading={createUserMutation.isLoading}
        />
      )}

      {/* Patient Form Modal */}
      {showPatientForm && (
        <PatientForm
          patient={editingPatient}
          onSubmit={handlePatientFormSubmit}
          onCancel={handleCancelPatientForm}
          isLoading={updatePatientMutation.isLoading}
        />
      )}
    </div>
  );
};

export default Patients; 