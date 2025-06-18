import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PagePatients } from '../components/pagePatients';
import { PageAdmin } from '../components/pageAdmin';
import { clinicalRecordService } from '../services/clinicalRecordService';
import { clinicalDocumentService } from '../services/clinicalDocumentService';

const ViewClinicalRecord = () => {
  const { recordId } = useParams();
  const [record, setRecord] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPatient, setIsPatient] = useState(false);

  useEffect(() => {
    // Determinar si es un paciente basándose en el rol almacenado
    const userRole = localStorage.getItem('userRole');
    setIsPatient(userRole === 'Patient');
    
    fetchRecord();
  }, [recordId]);

  const fetchRecord = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await clinicalRecordService.getClinicalRecord(recordId);
      setRecord(response.data.clinicalRecord);
      
      // Cargar documentos si el registro existe
      if (response.data.clinicalRecord) {
        await fetchDocuments(recordId);
      }
    } catch (err) {
      console.error('Error al cargar registro clínico:', err);
      setError('Error al cargar el registro clínico');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (recordId) => {
    try {
      const response = await clinicalDocumentService.listDocumentsByRecord(recordId);
      setDocuments(response.data.documents || []);
    } catch (err) {
      console.error('Error al cargar documentos:', err);
    }
  };

  const handleDownloadDocument = async (documentId) => {
    try {
      const downloadUrl = await clinicalDocumentService.downloadDocument(documentId);
      window.open(downloadUrl, '_blank');
    } catch (err) {
      console.error('Error al descargar documento:', err);
      alert('Error al descargar el documento. Por favor intente nuevamente.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const PageLayout = isPatient ? PagePatients : PageAdmin;

  if (loading) {
    return (
      <PageLayout>
        <div className="container mt-4">
          <div className="text-center">
            <p>Cargando registro clínico...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="container mt-4">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <Link to={isPatient ? "/patient/clinical-records" : "/admin/clinical-records"}>
            <button className="btn btn-secondary">Volver</button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  if (!record) {
    return (
      <PageLayout>
        <div className="container mt-4">
          <div className="alert alert-warning" role="alert">
            Registro clínico no encontrado
          </div>
          <Link to={isPatient ? "/patient/clinical-records" : "/admin/clinical-records"}>
            <button className="btn btn-secondary">Volver</button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Registro Clínico</h1>
          <div>
            <Link to={isPatient ? "/patient/clinical-records" : "/admin/clinical-records"}>
              <button className="btn btn-secondary me-2">Volver</button>
            </Link>
            {!isPatient && (
              <Link to={`/admin/clinical-records/${recordId}/edit`}>
                <button className="btn btn-primary">Editar</button>
              </Link>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title mb-0">{record.title}</h3>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Creado:</strong>
                    <p>{formatDate(record.createdAt)}</p>
                  </div>
                  <div className="col-md-6">
                    <strong>Actualizado:</strong>
                    <p>{formatDate(record.updatedAt)}</p>
                  </div>
                </div>
                
                {record.Patient && (
                  <div className="mb-3">
                    <strong>Paciente:</strong>
                    <p>{record.Patient.User.name} {record.Patient.User.lastname} (DNI: {record.Patient.User.dni})</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <strong>Contenido:</strong>
                  <div className="mt-2 p-3 bg-light rounded">
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                      {record.body}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Documentos Adjuntos ({documents.length})</h5>
              </div>
              <div className="card-body">
                {documents.length > 0 ? (
                  <div className="list-group">
                    {documents.map((doc) => (
                      <div key={doc.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <div className="d-flex align-items-center">
                            <span className="me-2">{clinicalDocumentService.getFileIcon(doc.mime_type)}</span>
                            <div>
                              <strong>{doc.description}</strong>
                              <br />
                              <small className="text-muted">
                                {clinicalDocumentService.formatFileSize(doc.file_size)} • {formatDate(doc.createdAt)}
                              </small>
                            </div>
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleDownloadDocument(doc.id)}
                          title="Descargar"
                        >
                          📥 Descargar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No hay documentos adjuntos</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ViewClinicalRecord; 