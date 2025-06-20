import React, { useState, useEffect } from 'react';
import { X, Stethoscope, Hash, User, Mail, Lock } from 'lucide-react';

const DoctorForm = ({ doctor, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
    dni: '',
    license_number: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.User?.name || '',
        lastname: doctor.User?.lastname || '',
        email: doctor.User?.email || '',
        password: '',
        dni: doctor.User?.dni || '',
        license_number: doctor.license_number || '',
      });
    }
  }, [doctor]);

  const validateForm = () => {
    const newErrors = {};

    if (!doctor) {
      if (!formData.name.trim()) {
        newErrors.name = 'El nombre es requerido';
      }

      if (!formData.lastname.trim()) {
        newErrors.lastname = 'El apellido es requerido';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'El email es requerido';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'El email no es válido';
      }

      if (!formData.password.trim()) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
    }

    if (!formData.license_number.trim()) {
      newErrors.license_number = 'El número de licencia es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = { ...formData };
      if (doctor && !formData.password) {
        delete submitData.password;
      }
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
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {doctor ? 'Editar Doctor' : 'Nuevo Doctor'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Doctor Info Display (solo en edición) */}
          {doctor && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Información del Doctor</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Nombre:</span>
                  <span className="ml-2 text-gray-900">
                    {doctor.User?.name} {doctor.User?.lastname}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="ml-2 text-gray-900">{doctor.User?.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">DNI:</span>
                  <span className="ml-2 text-gray-900">{doctor.User?.dni || 'No especificado'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Especialidades:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {doctor.Specialties?.map((specialty) => (
                      <span
                        key={specialty.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {specialty.name}
                      </span>
                    ))}
                    {(!doctor.Specialties || doctor.Specialties.length === 0) && (
                      <span className="text-sm text-gray-500">Sin especialidades</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (solo en creación) */}
            {!doctor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`input pl-10 ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Ingrese el nombre"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            )}

            {/* Lastname (solo en creación) */}
            {!doctor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.lastname}
                    onChange={(e) => handleInputChange('lastname', e.target.value)}
                    className={`input pl-10 ${errors.lastname ? 'border-red-500' : ''}`}
                    placeholder="Ingrese el apellido"
                  />
                </div>
                {errors.lastname && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastname}</p>
                )}
              </div>
            )}

            {/* Email (solo en creación) */}
            {!doctor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Ingrese el email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            )}

            {/* Password (solo en creación) */}
            {!doctor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`input pl-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Ingrese la contraseña"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            )}

            {/* DNI (solo en creación) */}
            {!doctor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DNI
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) => handleInputChange('dni', e.target.value)}
                    className="input pl-10"
                    placeholder="Ingrese el DNI (opcional)"
                  />
                </div>
              </div>
            )}

            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Licencia *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.license_number}
                  onChange={(e) => handleInputChange('license_number', e.target.value)}
                  className={`input pl-10 ${errors.license_number ? 'border-red-500' : ''}`}
                  placeholder="Ingrese el número de licencia"
                />
              </div>
              {errors.license_number && (
                <p className="mt-1 text-sm text-red-600">{errors.license_number}</p>
              )}
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
                    {doctor ? 'Actualizando...' : 'Creando...'}
                  </div>
                ) : (
                  doctor ? 'Actualizar Doctor' : 'Crear Doctor'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorForm; 