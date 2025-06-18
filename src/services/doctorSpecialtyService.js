import { apiRequest } from './apiConection';

/**
 * Servicio para manejar operaciones relacionadas con especialidades de doctores
 */
export const doctorSpecialtyService = {
  /**
   * Obtener todas las asociaciones doctor-especialidad
   * @returns {Promise<Object>} - Lista de todas las asociaciones
   */
  getAllDoctorSpecialties: async () => {
    const token = localStorage.getItem('token');
    return await apiRequest('/api/doctor-specialties', 'GET', null, token);
  },

  /**
   * Crear una nueva asociación doctor-especialidad
   * @param {string} doctorId - ID del doctor
   * @param {string} specialtyId - ID de la especialidad
   * @returns {Promise<Object>} - Nueva asociación creada
   */
  createDoctorSpecialty: async (doctorId, specialtyId) => {
    const token = localStorage.getItem('token');
    return await apiRequest('/api/doctor-specialties', 'POST', { doctor_id: doctorId, specialty_id: specialtyId }, token);
  },

  /**
   * Eliminar una asociación doctor-especialidad
   * @param {string} doctorId - ID del doctor
   * @param {string} specialtyId - ID de la especialidad
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  deleteDoctorSpecialty: async (doctorId, specialtyId) => {
    const token = localStorage.getItem('token');
    return await apiRequest(`/api/doctor-specialties/${doctorId}/${specialtyId}`, 'DELETE', null, token);
  },

  /**
   * Obtener especialidades de un doctor específico usando el endpoint existente
   * @param {string} doctorId - ID del doctor
   * @returns {Promise<Object>} - Especialidades del doctor
   */
  getDoctorSpecialties: async (doctorId) => {
    const token = localStorage.getItem('token');
    const allAssociations = await apiRequest('/api/doctor-specialties', 'GET', null, token);
    
    // Filtrar las asociaciones del doctor específico
    const doctorAssociations = allAssociations.data.filter(assoc => assoc.doctor_id === doctorId);
    
    return {
      statusCode: 200,
      data: doctorAssociations
    };
  },

  /**
   * Actualizar especialidades de un doctor usando los endpoints existentes
   * @param {string} doctorId - ID del doctor
   * @param {Array<string>} specialtyIds - Array de IDs de especialidades
   * @returns {Promise<Object>} - Resultado de la actualización
   */
  updateDoctorSpecialties: async (doctorId, specialtyIds) => {
    const token = localStorage.getItem('token');
    
    try {
      // Obtener especialidades actuales del doctor
      const currentResponse = await this.getDoctorSpecialties(doctorId);
      const currentAssociations = currentResponse.data;
      const currentSpecialtyIds = currentAssociations.map(assoc => assoc.specialty_id);

      // Encontrar especialidades a agregar (nuevas)
      const specialtiesToAdd = specialtyIds.filter(id => !currentSpecialtyIds.includes(id));
      
      // Encontrar especialidades a eliminar (que ya no están en la lista)
      const specialtiesToRemove = currentSpecialtyIds.filter(id => !specialtyIds.includes(id));

      // Crear nuevas asociaciones
      const addPromises = specialtiesToAdd.map(specialtyId => 
        this.createDoctorSpecialty(doctorId, specialtyId)
      );
      
      // Eliminar asociaciones que ya no existen
      const removePromises = specialtiesToRemove.map(specialtyId => 
        this.deleteDoctorSpecialty(doctorId, specialtyId)
      );

      // Ejecutar todas las operaciones
      await Promise.all([...addPromises, ...removePromises]);

      // Obtener las asociaciones actualizadas
      const updatedResponse = await this.getDoctorSpecialties(doctorId);

      return {
        statusCode: 200,
        data: {
          message: "Especialidades actualizadas exitosamente",
          associations: updatedResponse.data,
          added: specialtiesToAdd.length,
          removed: specialtiesToRemove.length
        }
      };
    } catch (error) {
      throw new Error(`Error al actualizar especialidades: ${error.message}`);
    }
  },

  /**
   * Comparar especialidades actuales con nuevas y determinar cambios
   * @param {Array} currentSpecialties - Especialidades actuales del doctor
   * @param {Array} newSpecialtyIds - IDs de las nuevas especialidades seleccionadas
   * @returns {Object} - Objeto con especialidades a agregar y eliminar
   */
  compareSpecialties: (currentSpecialties, newSpecialtyIds) => {
    const currentIds = currentSpecialties.map(spec => spec.Specialty?.id || spec.specialty_id);
    
    // Especialidades a agregar (están en nuevas pero no en actuales)
    const toAdd = newSpecialtyIds.filter(id => !currentIds.includes(id));
    
    // Especialidades a eliminar (están en actuales pero no en nuevas)
    const toRemove = currentIds.filter(id => !newSpecialtyIds.includes(id));
    
    return { toAdd, toRemove };
  },

  /**
   * Formatear especialidades para mostrar en la UI
   * @param {Array} associations - Asociaciones doctor-especialidad
   * @returns {Array} - Array de especialidades formateadas
   */
  formatSpecialtiesForDisplay: (associations) => {
    return associations.map(assoc => ({
      id: assoc.Specialty?.id || assoc.specialty_id,
      name: assoc.Specialty?.name || 'Especialidad no encontrada',
      is_active: assoc.Specialty?.is_active ?? true
    }));
  }
}; 