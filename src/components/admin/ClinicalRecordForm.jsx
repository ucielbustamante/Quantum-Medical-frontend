import React, { useState, useEffect } from 'react';
import { X, FileText, User, Calendar } from 'lucide-react';

const ClinicalRecordForm = ({ record, patients, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    patient_id: '',
    title: '',
    body: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (record) {
      setFormData({
        patient_id: record.patient_id || '',
        title: record.title || '',
        body: record.body || '',
      });
    }
  }, [record]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patient_id) {
      newErrors.patient_id = 'Debe seleccionar un paciente';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres';
    }

    if (!formData.body.trim()) {
      newErrors.body = 'El contenido es requerido';
    } else if (formData.body.trim().length < 10) {
      newErrors.body = 'El contenido debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {record ? 'Editar Historial Clínico' : 'Nuevo Historial Clínico'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Patient Selection */}
            {!record && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paciente *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={formData.patient_id}
                    onChange={(e) => handleInputChange('patient_id', e.target.value)}
                    className={`input pl-10 ${errors.patient_id ? 'border-red-500' : ''}`}
                  >
                    <option value="">Seleccionar paciente</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.User?.name} {patient.User?.lastname} - {patient.User?.email}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.patient_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.patient_id}</p>
                )}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`input pl-10 ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="Ej: Consulta inicial, Seguimiento, etc."
                  maxLength={200}
                />
              </div>
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/200 caracteres
              </p>
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenido *
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => handleInputChange('body', e.target.value)}
                className={`input min-h-32 resize-y ${errors.body ? 'border-red-500' : ''}`}
                placeholder="Describa los síntomas, diagnóstico, tratamiento, observaciones..."
                rows={8}
              />
              {errors.body && (
                <p className="mt-1 text-sm text-red-600">{errors.body}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.body.length} caracteres
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="btn-outline"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {record ? 'Actualizando...' : 'Creando...'}
                  </div>
                ) : (
                  record ? 'Actualizar Historial' : 'Crear Historial'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClinicalRecordForm; 