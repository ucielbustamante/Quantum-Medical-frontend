import React, { useState, useEffect } from 'react';
import { X, Stethoscope } from 'lucide-react';

const SpecialtyForm = ({ specialty, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (specialty) {
      setFormData({
        name: specialty.name || '',
      });
    }
  }, [specialty]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la especialidad es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
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
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {specialty ? 'Editar Especialidad' : 'Nueva Especialidad'}
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
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Especialidad *
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`input pl-10 ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Ej: Cardiología, Dermatología, etc."
                  maxLength={100}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.name.length}/100 caracteres
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
                    {specialty ? 'Actualizando...' : 'Creando...'}
                  </div>
                ) : (
                  specialty ? 'Actualizar Especialidad' : 'Crear Especialidad'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SpecialtyForm; 