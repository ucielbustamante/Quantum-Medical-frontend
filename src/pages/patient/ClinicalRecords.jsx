import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  User,
  Heart,
  Download,
  Clock,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ClinicalRecords = () => {
  const [searchParams, setSearchParams] = useState({
    title: '',
    limit: 10,
    offset: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordDocuments, setRecordDocuments] = useState({});

  const { data: recordsData, isLoading, error } = useQuery(
    ['patient-clinical-records', searchParams],
    async () => {
      const params = new URLSearchParams();
      if (searchParams.title) params.append('title', searchParams.title);
      if (searchParams.limit) params.append('limit', searchParams.limit);
      if (searchParams.offset) params.append('offset', searchParams.offset);
      
      const response = await api.get(`/api/clinical-records?${params.toString()}`);
      return response.data;
    }
  );

  const fetchRecordDocuments = async (recordId) => {
    try {
      const response = await api.get(`/api/clinical-documents/record/${recordId}`);
      return response.data.data.documents || [];
    } catch (error) {
      console.error('Error fetching documents for record:', recordId, error);
      return [];
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(prev => ({ ...prev, offset: 0 }));
  };

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  const handleView = async (record) => {
    setSelectedRecord(record);
    
    if (!recordDocuments[record.id]) {
      const documents = await fetchRecordDocuments(record.id);
      setRecordDocuments(prev => ({
        ...prev,
        [record.id]: documents
      }));
    }
  };

  const handleDownloadDocument = async (documentId) => {
    try {
      const response = await api.get(`/api/clinical-documents/${documentId}`);
      const { downloadUrl } = response.data.data;
      
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  if (isLoading) {
    return <LoadingSpinner size="lg" className="mt-8" />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error al cargar historiales: {error.message}</p>
      </div>
    );
  }

  const records = recordsData?.data?.records || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Historial Clínico</h1>
          <p className="mt-1 text-sm text-gray-500">
            Consulta tu historial médico personal
          </p>
        </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Records Grid */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Historiales ({records.length})
          </h3>
        </div>
        <div className="card-body">
          {records.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        {record.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatDate(record.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p className="truncate">
                        {record.body?.substring(0, 150)}...
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Documentos:</span>
                      <span>{record.ClinicalDocuments?.length || 0}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Última actualización:</span>
                      <span>{formatDate(record.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleView(record)}
                      className="flex-1 btn-outline text-sm"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay historiales</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron historiales clínicos con los criterios especificados.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Record Detail Modal */}
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
                {/* Record Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Información del Registro</h4>
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
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Documentos Asociados</h4>
                  {recordDocuments[selectedRecord.id] ? (
                    recordDocuments[selectedRecord.id].length > 0 ? (
                      <div className="space-y-2">
                        {recordDocuments[selectedRecord.id].map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">
                                {getFileIcon(doc.mime_type)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {doc.description || 'Sin descripción'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(doc.file_size)} • {formatDate(doc.createdAt)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownloadDocument(doc.id)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No hay documentos asociados a este registro</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-4">
                      <LoadingSpinner size="sm" />
                      <p className="text-sm text-gray-500 mt-2">Cargando documentos...</p>
                    </div>
                  )}
                </div>

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