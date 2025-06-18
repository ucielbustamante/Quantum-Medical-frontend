import { apiRequest } from './apiConection';

/**
 * Servicio para manejar operaciones relacionadas con registros clínicos
 */
export const clinicalRecordService = {
  /**
   * Crear un nuevo registro clínico
   * @param {Object} recordData - Datos del registro clínico
   * @param {string} recordData.patient_id - ID del paciente
   * @param {string} recordData.title - Título del registro
   * @param {string} recordData.body - Contenido del registro
   * @returns {Promise<Object>} - Registro clínico creado
   */
  createClinicalRecord: async (recordData) => {
    const token = localStorage.getItem('token');
    return await apiRequest('/api/clinical-records', 'POST', recordData, token);
  },

  /**
   * Obtener un registro clínico por ID
   * @param {string} recordId - ID del registro clínico
   * @returns {Promise<Object>} - Registro clínico
   */
  getClinicalRecord: async (recordId) => {
    const token = localStorage.getItem('token');
    return await apiRequest(`/api/clinical-records/${recordId}`, 'GET', null, token);
  },

  /**
   * Actualizar un registro clínico
   * @param {string} recordId - ID del registro clínico
   * @param {Object} recordData - Datos actualizados
   * @param {string} recordData.title - Título del registro
   * @param {string} recordData.body - Contenido del registro
   * @returns {Promise<Object>} - Registro clínico actualizado
   */
  updateClinicalRecord: async (recordId, recordData) => {
    const token = localStorage.getItem('token');
    return await apiRequest(`/api/clinical-records/${recordId}`, 'PUT', recordData, token);
  },

  /**
   * Eliminar un registro clínico
   * @param {string} recordId - ID del registro clínico
   * @returns {Promise<void>}
   */
  deleteClinicalRecord: async (recordId) => {
    const token = localStorage.getItem('token');
    return await apiRequest(`/api/clinical-records/${recordId}`, 'DELETE', null, token);
  },

  /**
   * Buscar registros clínicos
   * @param {Object} searchParams - Parámetros de búsqueda
   * @param {string} searchParams.patient_id - ID del paciente (opcional)
   * @param {string} searchParams.title - Título a buscar (opcional)
   * @param {number} searchParams.limit - Límite de resultados (opcional)
   * @param {number} searchParams.offset - Offset para paginación (opcional)
   * @returns {Promise<Object>} - Lista de registros clínicos
   */
  searchClinicalRecords: async (searchParams = {}) => {
    const token = localStorage.getItem('token');
    const queryString = new URLSearchParams(searchParams).toString();
    return await apiRequest(`/api/clinical-records?${queryString}`, 'GET', null, token);
  },

  /**
   * Obtener registros clínicos de un paciente específico
   * @param {string} patientId - ID del paciente
   * @returns {Promise<Object>} - Lista de registros clínicos del paciente
   */
  getPatientClinicalRecords: async (patientId) => {
    const token = localStorage.getItem('token');
    return await apiRequest(`/api/clinical-records?patient_id=${patientId}`, 'GET', null, token);
  },

  /**
   * Obtener registros clínicos del paciente actual (para pacientes)
   * @returns {Promise<Object>} - Lista de registros clínicos del paciente actual
   */
  getMyClinicalRecords: async () => {
    const token = localStorage.getItem('token');
    return await apiRequest('/api/clinical-records', 'GET', null, token);
  }
}; 