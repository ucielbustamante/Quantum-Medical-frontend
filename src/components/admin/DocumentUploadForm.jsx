import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { toast } from 'react-hot-toast';
import { X, Upload, FileText, User, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const DocumentUploadForm = ({ records, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    clinical_record_id: '',
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const uploadDocumentMutation = useMutation(
    async (formDataToSend) => {
      const data = new FormData();
      data.append('file', selectedFile);
      data.append('description', formDataToSend.description);
      
      const response = await api.post(`/api/clinical-documents/upload/${formDataToSend.clinical_record_id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Documento subido exitosamente');
        onSuccess();
      },
      onError: (error) => {
        console.error('Upload error:', error);
        console.error('Error response:', error.response?.data);
        toast.error(error.response?.data?.message || 'Error al subir documento');
        setIsUploading(false);
      },
    }
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clinical_record_id) {
      newErrors.clinical_record_id = 'Debe seleccionar un historial clínico';
    }

    if (!selectedFile) {
      newErrors.file = 'Debe seleccionar un archivo';
    } else {
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        newErrors.file = 'Tipo de archivo no permitido. Use PDF, imágenes, texto o documentos de Word.';
      }

      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        newErrors.file = 'El archivo es demasiado grande. Máximo 10MB.';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (formData.description.trim().length < 3) {
      newErrors.description = 'La descripción debe tener al menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsUploading(true);
      uploadDocumentMutation.mutate(formData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (errors.file) {
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (!file) return '📁';
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('image')) return '🖼️';
    if (file.type.includes('text')) return '📝';
    if (file.type.includes('word')) return '📝';
    return '📁';
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Subir Documento Médico
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
            {/* Clinical Record Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Historial Clínico *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={formData.clinical_record_id}
                  onChange={(e) => handleInputChange('clinical_record_id', e.target.value)}
                  className={`input pl-10 ${errors.clinical_record_id ? 'border-red-500' : ''}`}
                >
                  <option value="">Seleccionar historial clínico</option>
                  {records.map((record) => (
                    <option key={record.id} value={record.id}>
                      {record.title} - {record.Patient?.User?.name} {record.Patient?.User?.lastname}
                    </option>
                  ))}
                </select>
              </div>
              {errors.clinical_record_id && (
                <p className="mt-1 text-sm text-red-600">{errors.clinical_record_id}</p>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Archivo *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Subir archivo</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.txt,.doc,.docx"
                      />
                    </label>
                    <p className="pl-1">o arrastrar y soltar</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, imágenes, texto o documentos de Word hasta 10MB
                  </p>
                </div>
              </div>
              {selectedFile && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getFileIcon(selectedFile)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(selectedFile.size)} • {selectedFile.type}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {errors.file && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  {errors.file}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`input pl-10 ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Ej: Radiografía de tórax, Análisis de sangre, etc."
                  maxLength={200}
                />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/200 caracteres
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="btn-outline"
                disabled={isUploading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Subiendo...
                  </div>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Documento
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadForm; 