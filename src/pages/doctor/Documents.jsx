import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
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
  Upload,
  Plus,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import DocumentUploadForm from '../../components/admin/DocumentUploadForm';

const Documents = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    description: '',
    patient_id: '',
    limit: 10,
    offset: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [allDocuments, setAllDocuments] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const queryClient = useQueryClient();

  const { data: recordsData, isLoading: recordsLoading, error: recordsError } = useQuery(
    ['doctor-clinical-records'],
    async () => {
      const response = await api.get('/api/clinical-records');
      return response.data;
    }
  );

  const { data: patientsData } = useQuery(
    ['doctor-patients'],
    async () => {
      try {
        const doctorResponse = await api.post('/api/doctors/search', { 
          email: user.email,
          limit: 1 
        });
        
        if (doctorResponse.data.data && doctorResponse.data.data.length > 0) {
          const doctorId = doctorResponse.data.data[0].id;
          const appointmentsResponse = await api.get(`/api/doctors/${doctorId}/appointments`);
          const appointments = appointmentsResponse.data.data || [];
          
          const patientIds = [...new Set(appointments.map(apt => apt.patient_id).filter(Boolean))];
          
          const allPatientsResponse = await api.post('/api/patients/search', { limit: 1000 });
          const allPatients = allPatientsResponse.data.data || [];
          
          return allPatients.filter(patient => patientIds.includes(patient.id));
        }
        return [];
      } catch (error) {
        console.error('Error getting doctor patients:', error);
        return [];
      }
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
              recordId: record.id,
              patientName: record.Patient?.User?.name,
              patientLastname: record.Patient?.User?.lastname,
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
    if (searchParams.patient_id) {
      const patientFullName = `${doc.patientName || ''} ${doc.patientLastname || ''}`.toLowerCase();
      const selectedPatient = patientsData?.find(p => p.id === searchParams.patient_id);
      if (selectedPatient) {
        const selectedPatientName = `${selectedPatient.User?.name || ''} ${selectedPatient.User?.lastname || ''}`.toLowerCase();
        if (patientFullName !== selectedPatientName) {
          return false;
        }
      }
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

  const patients = patientsData || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos Médicos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona los documentos médicos de tus pacientes
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowUploadForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Subir Documento</span>
          </button>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </button>
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
                    patient_id: '',
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.User?.name} {patient.User?.lastname}
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

      {/* Documents List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Documentos ({filteredDocuments.length})
          </h3>
        </div>
        <div className="card-body">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron documentos con los criterios especificados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getFileIcon(doc.mime_type)}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{doc.description}</h4>
                        <p className="text-sm text-gray-500">
                          {doc.patientName} {doc.patientLastname} • {doc.recordTitle}
                        </p>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-400">
                          <span>{getFileType(doc.mime_type)}</span>
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>{formatDate(doc.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(doc)}
                        className="btn-outline"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(doc.id)}
                        className="btn-outline"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Details Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-2xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
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
                <div className="flex items-center space-x-4">
                  {getFileIcon(selectedDocument.mime_type)}
                  <div>
                    <h4 className="text-xl font-medium text-gray-900">
                      {selectedDocument.description}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {getFileType(selectedDocument.mime_type)} • {formatFileSize(selectedDocument.file_size)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Paciente:</span>
                    <p className="text-gray-600">
                      {selectedDocument.patientName} {selectedDocument.patientLastname}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Historial:</span>
                    <p className="text-gray-600">{selectedDocument.recordTitle}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Fecha de Subida:</span>
                    <p className="text-gray-600">{formatDate(selectedDocument.createdAt)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tipo de Archivo:</span>
                    <p className="text-gray-600">{selectedDocument.mime_type}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => handleDownloadDocument(selectedDocument.id)}
                    className="btn-primary"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && (
        <DocumentUploadForm
          records={recordsData?.data?.records || []}
          onCancel={() => setShowUploadForm(false)}
          onSuccess={() => {
            setShowUploadForm(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default Documents; 