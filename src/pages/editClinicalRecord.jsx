import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageAdmin } from '../components/pageAdmin';
import { clinicalRecordService } from '../services/clinicalRecordService';

const EditClinicalRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    body: ''
  });
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRecord();
  }, [id]);

  const fetchRecord = async () => {
    try {
      const response = await clinicalRecordService.getClinicalRecord(id);
      const recordData = response.data.clinicalRecord;
      setRecord(recordData);
      setFormData({
        title: recordData.title,
        body: recordData.body
      });
    } catch (err) {
      console.error('Error al cargar registro clínico:', err);
      setError('Error al cargar el registro clínico');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.body.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await clinicalRecordService.updateClinicalRecord(id, formData);
      
      setSuccess('Registro clínico actualizado exitosamente');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate(`/admin/clinical-records/${id}`);
      }, 2000);

    } catch (err) {
      console.error('Error al actualizar registro clínico:', err);
      setError(err.message || 'Error al actualizar el registro clínico');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageAdmin>
        <div className="container mt-4">
          <div className="text-center">
            <p>Cargando registro clínico...</p>
          </div>
        </div>
      </PageAdmin>
    );
  }

  if (error && !record) {
    return (
      <PageAdmin>
        <div className="container mt-4">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/admin/clinical-records')}
          >
            Volver a Registros Clínicos
          </button>
        </div>
      </PageAdmin>
    );
  }

  if (!record) {
    return (
      <PageAdmin>
        <div className="container mt-4">
          <div className="alert alert-warning" role="alert">
            Registro clínico no encontrado
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/admin/clinical-records')}
          >
            Volver a Registros Clínicos
          </button>
        </div>
      </PageAdmin>
    );
  }

  return (
    <PageAdmin>
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title mb-0">Editar Registro Clínico</h3>
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

                <div className="mb-4">
                  <h5>Información del Paciente</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Nombre:</strong>
                      <p>{record.Patient?.User?.name} {record.Patient?.User?.lastname}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>DNI:</strong>
                      <p>{record.Patient?.User?.dni}</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Email:</strong>
                      <p>{record.Patient?.User?.email}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Estado:</strong>
                      <p>
                        <span className={`badge ${record.is_active ? 'bg-success' : 'bg-danger'}`}>
                          {record.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
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
                      rows="15"
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
                      onClick={() => navigate(`/admin/clinical-records/${id}`)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
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

export default EditClinicalRecord; 