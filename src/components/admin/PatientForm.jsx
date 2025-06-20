import React, { useState, useEffect } from 'react';
import { X, Heart, CreditCard, Calendar } from 'lucide-react';

const PatientForm = ({ patient, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    health_insurance: '',
    health_insurance_number: '',
    birthday: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (patient) {
      setFormData({
        health_insurance: patient.health_insurance || '',
        health_insurance_number: patient.health_insurance_number || '',
        birthday: patient.birthday ? new Date(patient.birthday).toISOString().split('T')[0] : '',
      });
    }
  }, [patient]);

  const validateForm = () => {
    const newErrors = {};

    if (formData.birthday) {
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birthday = 'La fecha de nacimiento no puede ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = { ...formData };
      if (!submitData.health_insurance) submitData.health_insurance = null;
      if (!submitData.health_insurance_number) submitData.health_insurance_number = null;
      if (!submitData.birthday) submitData.birthday = null;
      onSubmit(submitData);
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
              Editar Paciente
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Patient Info Display */}
          {patient && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Información del Paciente</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Nombre:</span>
                  <span className="ml-2 text-gray-900">
                    {patient.User?.name} {patient.User?.lastname}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="ml-2 text-gray-900">{patient.User?.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">DNI:</span>
                  <span className="ml-2 text-gray-900">{patient.User?.dni || 'No especificado'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => handleInputChange('birthday', e.target.value)}
                  className={`input pl-10 ${errors.birthday ? 'border-red-500' : ''}`}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.birthday && (
                <p className="mt-1 text-sm text-red-600">{errors.birthday}</p>
              )}
            </div>

            {/* Health Insurance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Obra Social
              </label>
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.health_insurance}
                  onChange={(e) => handleInputChange('health_insurance', e.target.value)}
                  className="input pl-10"
                  placeholder="Ingrese la obra social (opcional)"
                />
              </div>
            </div>

            {/* Health Insurance Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Obra Social
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.health_insurance_number}
                  onChange={(e) => handleInputChange('health_insurance_number', e.target.value)}
                  className="input pl-10"
                  placeholder="Ingrese el número de obra social (opcional)"
                />
              </div>
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
                    Actualizando...
                  </div>
                ) : (
                  'Actualizar Paciente'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientForm; 