import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  Stethoscope,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SpecialtyForm from '../../components/admin/SpecialtyForm';

const Specialties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);

  const queryClient = useQueryClient();

  const { data: specialtiesData, isLoading, error } = useQuery(
    ['specialties'],
    async () => {
      const response = await api.get('/api/specialties');
      return response.data;
    }
  );

  const createSpecialtyMutation = useMutation(
    async (specialtyData) => {
      const response = await api.post('/api/specialties', specialtyData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['specialties']);
        toast.success('Especialidad creada exitosamente');
        setShowForm(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al crear especialidad');
      },
    }
  );

  const updateSpecialtyMutation = useMutation(
    async ({ id, specialtyData }) => {
      const response = await api.put(`/api/specialties/${id}`, specialtyData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['specialties']);
        toast.success('Especialidad actualizada exitosamente');
        setShowForm(false);
        setEditingSpecialty(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al actualizar especialidad');
      },
    }
  );

  const deleteSpecialtyMutation = useMutation(
    async (specialtyId) => {
      const response = await api.delete(`/api/specialties/${specialtyId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['specialties']);
        toast.success('Especialidad eliminada exitosamente');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al eliminar especialidad');
      },
    }
  );

  const handleEdit = (specialty) => {
    setEditingSpecialty(specialty);
    setShowForm(true);
  };

  const handleDelete = (specialtyId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta especialidad?')) {
      deleteSpecialtyMutation.mutate(specialtyId);
    }
  };

  const handleFormSubmit = (specialtyData) => {
    if (editingSpecialty) {
      updateSpecialtyMutation.mutate({ id: editingSpecialty.id, specialtyData });
    } else {
      createSpecialtyMutation.mutate(specialtyData);
    }
  };

  const filteredSpecialties = specialtiesData?.data?.filter(specialty =>
    specialty.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <LoadingSpinner size="lg" className="mt-8" />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error al cargar especialidades: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Especialidades</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra las especialidades médicas del sistema
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Especialidad
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Buscar Especialidades</h3>
            <button
              onClick={() => setSearchTerm('')}
              className="btn-outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Limpiar
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
              placeholder="Buscar especialidades..."
            />
          </div>
        </div>
      </div>

      {/* Specialties Grid */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Especialidades ({filteredSpecialties.length})
          </h3>
        </div>
        <div className="card-body">
          {filteredSpecialties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSpecialties.map((specialty) => (
                <div
                  key={specialty.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Stethoscope className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {specialty.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          ID: {specialty.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(specialty)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(specialty.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        disabled={deleteSpecialtyMutation.isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'No se encontraron especialidades' : 'No hay especialidades'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? 'No se encontraron especialidades con el término de búsqueda especificado.'
                  : 'Comienza creando la primera especialidad médica.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Specialty Form Modal */}
      {showForm && (
        <SpecialtyForm
          specialty={editingSpecialty}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingSpecialty(null);
          }}
          isLoading={createSpecialtyMutation.isLoading || updateSpecialtyMutation.isLoading}
        />
      )}
    </div>
  );
};

export default Specialties; 