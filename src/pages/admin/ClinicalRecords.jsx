import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  User,
  Heart,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ClinicalRecordForm from '../../components/admin/ClinicalRecordForm';

const ClinicalRecords = () => {
  const [searchParams, setSearchParams] = useState({
    patient_id: '',
    title: '',
    limit: 10,
    offset: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const queryClient = useQueryClient();

  const { data: recordsData, isLoading, error } = useQuery(
    ['clinical-records', searchParams],
    async () => {
      const params = new URLSearchParams();
      if (searchParams.patient_id) params.append('patient_id', searchParams.patient_id);
      if (searchParams.title) params.append('title', searchParams.title);
      if (searchParams.limit) params.append('limit', searchParams.limit);
      if (searchParams.offset) params.append('offset', searchParams.offset);
      
      const response = await api.get(`/api/clinical-records?${params.toString()}`);
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

  const { data: documentsData, refetch: refetchDocuments } = useQuery(
    ['clinical-documents', selectedRecord?.id],
    async () => {
      if (!selectedRecord?.id) return { data: [] };
      try {
        const response = await api.get(`/api/clinical-documents/record/${selectedRecord.id}`);
        return response.data;
      } catch (error) {
        console.error('Error getting documents:', error);
        return { data: [] };
      }
    },
    { enabled: !!selectedRecord?.id }
  );

  const createRecordMutation = useMutation(
    async (recordData) => {
      const response = await api.post('/api/clinical-records', recordData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['clinical-records']);
        toast.success('Historial clínico creado exitosamente');
        setShowForm(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al crear historial clínico');
      },
    }
  );

  const updateRecordMutation = useMutation(
    async ({ id, recordData }) => {
      const response = await api.put(`/api/clinical-records/${id}`, recordData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['clinical-records']);
        toast.success('Historial clínico actualizado exitosamente');
        setShowForm(false);
        setEditingRecord(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al actualizar historial clínico');
      },
    }
  );

  const deleteRecordMutation = useMutation(
    async (recordId) => {
      const response = await api.delete(`/api/clinical-records/${recordId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['clinical-records']);
        toast.success('Historial clínico eliminado exitosamente');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al eliminar historial clínico');
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

  const handleEdit = (record) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDelete = (recordId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este historial clínico?')) {
      deleteRecordMutation.mutate(recordId);
    }
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    if (record.id) {
      refetchDocuments();
    }
  };

  const handleFormSubmit = (recordData) => {
    if (editingRecord) {
      updateRecordMutation.mutate({ id: editingRecord.id, recordData });
    } else {
      createRecordMutation.mutate(recordData);
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
        <p className="text-red-600">Error al cargar historiales clínicos: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Historiales Clínicos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra los historiales clínicos del sistema
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Historial
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Buscar Historiales</h3>
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
                    patient_id: '',
                    title: '',
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
                  Título
                </label>
                <input
                  type="text"
                  value={searchParams.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="input"
                  placeholder="Buscar por título"
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

      {/* Clinical Records Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Historiales Clínicos ({recordsData?.data?.records?.length || 0})
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
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Creación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recordsData?.data?.records?.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Heart className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {record.Patient?.User?.name} {record.Patient?.User?.lastname}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.Patient?.User?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {record.body?.substring(0, 100)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                        {formatDate(record.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {record.ClinicalDocuments?.length || 0} documentos
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(record)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={deleteRecordMutation.isLoading}
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

          {recordsData?.data?.records?.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay historiales clínicos</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron historiales clínicos con los criterios de búsqueda especificados.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Record Form Modal */}
      {showForm && (
        <ClinicalRecordForm
          record={editingRecord}
          patients={patientsData?.data || []}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRecord(null);
          }}
          isLoading={createRecordMutation.isLoading || updateRecordMutation.isLoading}
        />
      )}

      {/* Clinical Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles del Historial Clínico
                </h3>
                <button
                  onClick={() => setSelectedRecord(null)}
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
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Información del Paciente</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Nombre:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedRecord.Patient?.User?.name} {selectedRecord.Patient?.User?.lastname}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="ml-2 text-gray-900">{selectedRecord.Patient?.User?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Record Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Detalles del Registro</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Título</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRecord.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contenido</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedRecord.body}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRecord.createdAt)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Última Actualización</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRecord.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                {documentsData?.data && documentsData.data.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Documentos Asociados</h4>
                    <div className="space-y-2">
                      {documentsData.data.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{doc.description || 'Sin descripción'}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'Tamaño desconocido'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedRecord(null)}
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

export default ClinicalRecords; 