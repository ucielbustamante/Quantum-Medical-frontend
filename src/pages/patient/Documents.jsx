import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  Folder,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Calendar,
  FileText,
  Image,
  File,
  Trash2,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Documents = () => {
  const [searchParams, setSearchParams] = useState({
    description: '',
    limit: 10,
    offset: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [allDocuments, setAllDocuments] = useState([]);

  const { data: recordsData, isLoading: recordsLoading, error: recordsError } = useQuery(
    ['patient-clinical-records'],
    async () => {
      const response = await api.get('/api/clinical-records');
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
            const recordDocuments = response.data.data.documents || [];
            
            const documentsWithRecordInfo = recordDocuments.map(doc => ({
              ...doc,
              recordTitle: record.title,
              recordId: record.id
            }));
            
            documents.push(...documentsWithRecordInfo);
          } catch (error) {
            console.error('Error fetching documents for record:', record.id, error);
          }
        }
        
        setAllDocuments(documents);
      }
    };

    fetchAllDocuments();
  }, [recordsData]);

  const filteredDocuments = allDocuments.filter(doc => {
    if (searchParams.description && !doc.description?.toLowerCase().includes(searchParams.description.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(prev => ({ ...prev, offset: 0 }));
  };

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  const handleView = (document) => {
    setSelectedDocument(document);
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
    if (mimeType?.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />;
    if (mimeType?.includes('image')) return <Image className="h-6 w-6 text-green-500" />;
    if (mimeType?.includes('text')) return <FileText className="h-6 w-6 text-blue-500" />;
    return <File className="h-6 w-6 text-gray-500" />;
  };

  const getFileType = (mimeType) => {
    if (mimeType?.includes('pdf')) return 'PDF';
    if (mimeType?.includes('image')) return 'Imagen';
    if (mimeType?.includes('text')) return 'Texto';
    return 'Archivo';
  };

  if (recordsLoading) {
    return <LoadingSpinner size="lg" className="mt-8" />;
  }

  if (recordsError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error al cargar documentos: {recordsError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Documentos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona tus documentos médicos
          </p>
        </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Documents Grid */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Documentos ({filteredDocuments.length})
          </h3>
        </div>
        <div className="card-body">
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        {getFileIcon(document.mime_type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        {document.description || 'Sin descripción'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {getFileType(document.mime_type)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p className="truncate">
                        Registro: {document.recordTitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Tamaño:</span>
                      <span>{formatFileSize(document.file_size)}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Fecha:</span>
                      <span>{formatDate(document.createdAt)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleView(document)}
                      className="flex-1 btn-outline text-sm"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(document.id)}
                      className="flex-1 btn-primary text-sm"
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Descargar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Folder className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchParams.description 
                  ? 'No se encontraron documentos con los criterios especificados.'
                  : 'No tienes documentos médicos asociados a tus historiales clínicos.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

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

              <div className="space-y-6">
                {/* Document Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Información del Documento</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Descripción</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedDocument.description || 'Sin descripción'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Registro Clínico</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedDocument.recordTitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Archivo</label>
                        <p className="mt-1 text-sm text-gray-900">{getFileType(selectedDocument.mime_type)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tamaño</label>
                        <p className="mt-1 text-sm text-gray-900">{formatFileSize(selectedDocument.file_size)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(selectedDocument.createdAt)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">ID del Archivo</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono">{selectedDocument.file_id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleDownloadDocument(selectedDocument.id)}
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