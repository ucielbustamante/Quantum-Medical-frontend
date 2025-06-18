import { apiRequest } from './apiConection';

/**
 * Servicio para manejar operaciones relacionadas con documentos clínicos
 */
export const clinicalDocumentService = {
  /**
   * Subir un documento clínico
   * @param {string} recordId - ID del registro clínico
   * @param {FormData} formData - FormData con el archivo y metadatos
   * @returns {Promise<Object>} - Documento clínico subido
   */
  uploadDocument: async (recordId, formData) => {
    const token = localStorage.getItem('token');
    
    // Usar fetch directamente para manejar FormData
    console.log('--- API URL de clinicalDocumentService', import.meta.env.VITE_API_URL);
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/clinical-documents/upload/${recordId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.data?.message || 'Error al subir documento');
    }

    return await response.json();
  },

  /**
   * Obtener un documento clínico por ID
   * @param {string} documentId - ID del documento clínico
   * @returns {Promise<Object>} - Documento clínico con URL de descarga
   */
  getDocument: async (documentId) => {
    const token = localStorage.getItem('token');
    return await apiRequest(`/api/clinical-documents/${documentId}`, 'GET', null, token);
  },

  /**
   * Eliminar un documento clínico
   * @param {string} documentId - ID del documento clínico
   * @returns {Promise<void>}
   */
  deleteDocument: async (documentId) => {
    const token = localStorage.getItem('token');
    return await apiRequest(`/api/clinical-documents/${documentId}`, 'DELETE', null, token);
  },

  /**
   * Listar documentos de un registro clínico
   * @param {string} recordId - ID del registro clínico
   * @returns {Promise<Object>} - Lista de documentos del registro
   */
  listDocumentsByRecord: async (recordId) => {
    const token = localStorage.getItem('token');
    return await apiRequest(`/api/clinical-documents/record/${recordId}`, 'GET', null, token);
  },

  /**
   * Descargar un documento clínico
   * @param {string} documentId - ID del documento clínico
   * @returns {Promise<string>} - URL de descarga del documento
   */
  downloadDocument: async (documentId) => {
    const token = localStorage.getItem('token');
    const response = await apiRequest(`/api/clinical-documents/${documentId}`, 'GET', null, token);
    return response.data.downloadUrl;
  },

  /**
   * Formatear tamaño de archivo
   * @param {number} bytes - Tamaño en bytes
   * @returns {string} - Tamaño formateado
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Obtener icono según tipo de archivo
   * @param {string} mimeType - Tipo MIME del archivo
   * @returns {string} - Nombre del icono
   */
  getFileIcon: (mimeType) => {
    if (mimeType.startsWith('image/')) return '📷';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈';
    return '📎';
  },

  /**
   * Validar archivo antes de subir
   * @param {File} file - Archivo a validar
   * @param {number} maxSizeMB - Tamaño máximo en MB
   * @returns {Object} - { isValid: boolean, message: string }
   */
  validateFile: (file, maxSizeMB = 10) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        message: `El archivo es demasiado grande. Máximo ${maxSizeMB}MB permitido.`
      };
    }

    // Tipos de archivo permitidos
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        message: 'Tipo de archivo no permitido. Solo se permiten imágenes, PDFs, documentos de Office y archivos de texto.'
      };
    }

    return { isValid: true, message: '' };
  }
}; 