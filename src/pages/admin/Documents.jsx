import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  Folder,
  Upload,
  Search,
  Trash2,
  Download,
  Eye,
  Filter,
  RefreshCw,
  FileText,
  User,
  Calendar,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DocumentUploadForm from '../../components/admin/DocumentUploadForm';

const Documents = () => {
  const [searchParams, setSearchParams] = useState({
    clinical_record_id: '',
    user_id: '',
    description: '',
    limit: 10,
    offset: 0,
  });
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [allDocuments, setAllDocuments] = useState([]);

  const queryClient = useQueryClient();

  const { data: recordsData } = useQuery(
    ['clinical-records'],
    async () => {
      const response = await api.get('/api/clinical-records');
      return response.data;
    }
  );

  const { data: usersData } = useQuery(
    ['users'],
    async () => {
      const response = await api.post('/api/users/search', { limit: 100 });
      return response.data;
    }
  );

  useEffect(() => {
    const fetchAllDocuments = async () => {
      if (recordsData?.data?.records) {
        const documents = [];
        
        for (const record of recordsData.data.records) {
          try {
            const response = await api.get(`/api/clinical-documents/record/${record.id}`);
            const recordDocuments = response.data?.data?.documents;
            if (recordDocuments && Array.isArray(recordDocuments)) {
              const documentsWithRecord = recordDocuments.map(doc => ({
                ...doc,
                clinical_record: record
              }));
              documents.push(...documentsWithRecord);
            } else {
              console.warn(`No documents array found for record ${record.id}:`, response.data);
            }
          } catch (error) {
            console.warn(`Error getting documents for record ${record.id}:`, error);
          }
        }
        setAllDocuments(documents);
      }
    };

    fetchAllDocuments();
  }, [recordsData]);

  const filteredDocuments = allDocuments.filter(doc => {
    if (searchParams.clinical_record_id && doc.clinical_record_id !== searchParams.clinical_record_id) {
      return false;
    }
    if (searchParams.user_id && doc.clinical_record?.patient_id !== searchParams.user_id) {
      return false;
    }
    if (searchParams.description && !doc.description?.toLowerCase().includes(searchParams.description.toLowerCase())) {
      return false;
    }
    return true;
  });

  const start = searchParams.offset;
  const end = start + searchParams.limit;
  const paginatedDocuments = filteredDocuments.slice(start, end);

  const deleteDocumentMutation = useMutation(
    async (documentId) => {
      const response = await api.delete(`/api/clinical-documents/${documentId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        setAllDocuments(prev => prev.filter(doc => doc.id !== deleteDocumentMutation.variables));
        toast.success('Documento eliminado exitosamente');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al eliminar documento');
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

  const handleDelete = (documentId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      deleteDocumentMutation.mutate(documentId);
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const response = await api.get(`/api/clinical-documents/${documentId}`);
      const { downloadUrl } = response.data.data;
      // Limitacion de google para descargar 403 code
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Descarga iniciada');
    } catch (error) {
      toast.error('Error al descargar el documento');
    }
  };

  const handleView = (document) => {
    setSelectedDocument(document);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Desconocido';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('image')) return '🖼️';
    if (mimeType?.includes('text')) return '📝';
    return '📁';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Documentos Médicos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra los documentos médicos del sistema
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          className="btn-primary"
        >
          <Upload className="mr-2 h-4 w-4" />
          Subir Documento
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Buscar Documentos</h3>
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
                    clinical_record_id: '',
                    user_id: '',
                    description: '',
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
                  Historial Clínico
                </label>
                <select
                  value={searchParams.clinical_record_id}
                  onChange={(e) => handleInputChange('clinical_record_id', e.target.value)}
                  className="input"
                >
                  <option value="">Todos los historiales</option>
                  {recordsData?.data?.records?.map((record) => (
                    <option key={record.id} value={record.id}>
                      {record.title} - {record.Patient?.User?.name} {record.Patient?.User?.lastname}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Usuario
                </label>
                <select
                  value={searchParams.user_id}
                  onChange={(e) => handleInputChange('user_id', e.target.value)}
                  className="input"
                >
                  <option value="">Todos los usuarios</option>
                  {usersData?.data?.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} {user.lastname} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <input
                  type="text"
                  value={searchParams.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="input"
                  placeholder="Buscar por descripción"
                />
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Documents Grid */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Documentos ({paginatedDocuments?.length || 0})
          </h3>
        </div>
        <div className="card-body">
          {paginatedDocuments?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedDocuments.map((document) => (
                <div
                  key={document.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getFileIcon(document.mime_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {document.description || 'Sin descripción'}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(document.file_size)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(document.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleView(document)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(document.id)}
                        className="text-green-600 hover:text-green-900 p-1"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(document.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        disabled={deleteDocumentMutation.isLoading}
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
              <Folder className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron documentos con los criterios de búsqueda especificados.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Document Upload Form Modal */}
      {showUploadForm && (
        <DocumentUploadForm
          records={recordsData?.data?.records || []}
          onCancel={() => setShowUploadForm(false)}
          onSuccess={() => {
            setShowUploadForm(false);
            queryClient.invalidateQueries(['documents']);
          }}
        />
      )}

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles del Documento
                </h3>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">
                    {getFileIcon(selectedDocument.mime_type)}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {selectedDocument.description || 'Sin descripción'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Tipo: {selectedDocument.mime_type || 'Desconocido'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tamaño</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatFileSize(selectedDocument.file_size)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Subida</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedDocument.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleDownload(selectedDocument.id)}
                    className="btn-primary"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </button>
                  <button
                    onClick={() => setSelectedDocument(null)}
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

export default Documents; 