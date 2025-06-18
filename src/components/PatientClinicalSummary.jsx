import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clinicalRecordService } from '../services/clinicalRecordService';

const PatientClinicalSummary = ({ patientId, isPatient = false }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patientId || isPatient) {
      fetchRecords();
    }
  }, [patientId, isPatient]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (isPatient) {
        // Para pacientes, obtener sus propios registros
        response = await clinicalRecordService.getMyClinicalRecords();
      } else {
        // Para admins, obtener registros de un paciente específico
        response = await clinicalRecordService.getPatientClinicalRecords(patientId);
      }
      
      setRecords(response.data.records || []);
    } catch (err) {
      console.error('Error al cargar registros clínicos:', err);
      setError('Error al cargar los registros clínicos');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center p-3">
        <small className="text-muted">Cargando registros clínicos...</small>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <small>{error}</small>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="card-title mb-0">Registros Clínicos ({records.length})</h6>
        {isPatient ? (
          <Link to="/patient/clinical-records" className="btn btn-sm btn-primary">
            Ver Todos
          </Link>
        ) : (
          <Link to={`/admin/clinical-records?patient_id=${patientId}`} className="btn btn-sm btn-primary">
            Ver Todos
          </Link>
        )}
      </div>
      <div className="card-body">
        {records.length > 0 ? (
          <div className="list-group list-group-flush">
            {records.slice(0, 3).map((record) => (
              <div key={record.id} className="list-group-item px-0">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{record.title}</h6>
                    <p className="mb-1 text-muted small">
                      {record.body.substring(0, 100)}...
                    </p>
                    <small className="text-muted">
                      {formatDate(record.createdAt)}
                    </small>
                  </div>
                  {isPatient ? (
                    <Link 
                      to={`/patient/clinical-records/${record.id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      Ver
                    </Link>
                  ) : (
                    <Link 
                      to={`/admin/clinical-records/${record.id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      Ver
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {records.length > 3 && (
              <div className="text-center mt-2">
                <small className="text-muted">
                  Y {records.length - 3} registros más...
                </small>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted small mb-2">No hay registros clínicos</p>
            {!isPatient && (
              <Link 
                to={`/admin/new-clinical-record/${patientId}`}
                className="btn btn-sm btn-outline-primary"
              >
                Crear Primer Registro
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientClinicalSummary; 