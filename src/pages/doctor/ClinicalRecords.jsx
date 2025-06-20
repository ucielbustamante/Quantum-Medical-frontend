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
  Plus,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

export default function ClinicalRecords() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    patient_id: '',
    title: '',
    limit: 10,
    offset: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordDocuments, setRecordDocuments] = useState({});

  const { data: recordsData, isLoading, error } = useQuery(
    ['doctor-clinical-records', searchParams],
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
  const patients = patientsData || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historiales Clínicos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona los historiales médicos de tus pacientes
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

      {/* Records List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Historiales Clínicos ({records.length})
          </h3>
        </div>
        <div className="card-body">
          {records.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay historiales</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron historiales clínicos con los criterios especificados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{record.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{record.body}</p>
                      
                      <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span>
                            {record.Patient?.User?.name} {record.Patient?.User?.lastname}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(record.createdAt)}</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          <span>
                            {recordDocuments[record.id]?.length || 0} documentos
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(record)}
                        className="btn-outline"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
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
                {/* Record Info */}
                <div>
                  <h4 className="text-xl font-medium text-gray-900 mb-2">
                    {selectedRecord.title}
                  </h4>
                  <p className="text-gray-600">{selectedRecord.body}</p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Paciente:</span>
                      <p className="text-gray-600">
                        {selectedRecord.Patient?.User?.name} {selectedRecord.Patient?.User?.lastname}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fecha de Creación:</span>
                      <p className="text-gray-600">{formatDate(selectedRecord.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h5 className="text-lg font-medium text-gray-900 mb-3">Documentos Asociados</h5>
                  {recordDocuments[selectedRecord.id]?.length > 0 ? (
                    <div className="space-y-2">
                      {recordDocuments[selectedRecord.id].map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getFileIcon(doc.mime_type)}</span>
                            <div>
                              <p className="font-medium text-gray-900">{doc.description}</p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(doc.file_size)} • {formatDate(doc.createdAt)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownloadDocument(doc.id)}
                            className="btn-outline"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Descargar
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No hay documentos asociados a este historial.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

 