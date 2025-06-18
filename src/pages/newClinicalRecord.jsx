import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageAdmin } from '../components/pageAdmin';
import { clinicalRecordService } from '../services/clinicalRecordService';
import { apiRequest } from '../services/apiConection';

const NewClinicalRecord = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [formData, setFormData] = useState({
    patient_id: patientId || '',
    title: '',
    body: ''
  });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await apiRequest('/api/patients/search', 'POST', { limit: 1000 }, token);
        setPatients(response.data || []);
      } catch (err) {
        console.error('Error al cargar pacientes:', err);
        setError('Error al cargar la lista de pacientes');
      }
    };

    fetchPatients();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patient_id || !formData.title || !formData.body.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await clinicalRecordService.createClinicalRecord(formData);
      
      setSuccess('Registro clínico creado exitosamente');
      setFormData({
        patient_id: patientId || '',
        title: '',
        body: ''
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/admin/clinical-records');
      }, 2000);

    } catch (err) {
      console.error('Error al crear registro clínico:', err);
      setError(err.message || 'Error al crear el registro clínico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageAdmin>
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title mb-0">Crear Nuevo Registro Clínico</h3>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="alert alert-success" role="alert">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="patient_id" className="form-label">
                      Paciente *
                    </label>
                    <select
                      id="patient_id"
                      name="patient_id"
                      className="form-select"
                      value={formData.patient_id}
                      onChange={handleInputChange}
                      required
                      disabled={!!patientId}
                    >
                      <option value="">Seleccionar paciente</option>
                      {patients.map(patient => (
                        <option key={patient.id} value={patient.id}>
                          {patient.User.name} {patient.User.lastname} - DNI: {patient.User.dni}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      Título del Registro *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className="form-control"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Ej: Consulta inicial, Seguimiento, etc."
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="body" className="form-label">
                      Contenido del Registro *
                    </label>
                    <textarea
                      id="body"
                      name="body"
                      className="form-control"
                      rows="10"
                      value={formData.body}
                      onChange={handleInputChange}
                      placeholder="Describa los detalles del registro clínico..."
                      required
                    />
                  </div>

                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate('/admin/clinical-records')}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Creando...' : 'Crear Registro Clínico'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageAdmin>
  );
};

export default NewClinicalRecord; 