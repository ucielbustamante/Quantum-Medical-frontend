import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  Users as UsersIcon,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import UserForm from '../../components/admin/UserForm';

const Users = () => {
  const [searchParams, setSearchParams] = useState({
    name: '',
    lastname: '',
    email: '',
    role: '',
    dni: '',
    limit: 10,
    offset: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const queryClient = useQueryClient();

  const { data: usersData, isLoading, error } = useQuery(
    ['users', searchParams],
    async () => {
      const response = await api.post('/api/users/search', searchParams);
      return response.data;
    }
  );

  const createUserMutation = useMutation(
    async (userData) => {
      const response = await api.post('/api/users', userData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast.success('Usuario creado exitosamente');
        setShowForm(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al crear usuario');
      },
    }
  );

  const updateUserMutation = useMutation(
    async ({ id, userData }) => {
      const response = await api.put(`/api/users/${id}`, userData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast.success('Usuario actualizado exitosamente');
        setShowForm(false);
        setEditingUser(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al actualizar usuario');
      },
    }
  );

  const deleteUserMutation = useMutation(
    async (userId) => {
      const response = await api.delete(`/api/users/${userId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast.success('Usuario eliminado exitosamente');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al eliminar usuario');
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

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleFormSubmit = (userData) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, userData });
    } else {
      createUserMutation.mutate(userData);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Doctor':
        return 'bg-blue-100 text-blue-800';
      case 'Patient':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <p className="text-red-600">Error al cargar usuarios: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra todos los usuarios del sistema
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Buscar Usuarios</h3>
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
                    role: '',
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
                    Rol
                  </label>
                  <select
                    value={searchParams.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="input"
                  >
                    <option value="">Todos los roles</option>
                    <option value="Admin">Administrador</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Patient">Paciente</option>
                  </select>
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

      {/* Users Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Usuarios ({usersData?.data?.length || 0})
          </h3>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
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
                {usersData?.data?.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name} {user.lastname}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.dni || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.is_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={deleteUserMutation.isLoading}
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

          {usersData?.data?.length === 0 && (
            <div className="text-center py-8">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron usuarios con los criterios de búsqueda especificados.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Form Modal */}
      {showForm && (
        <UserForm
          user={editingUser}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
          isLoading={createUserMutation.isLoading || updateUserMutation.isLoading}
        />
      )}
    </div>
  );
};

export default Users; 