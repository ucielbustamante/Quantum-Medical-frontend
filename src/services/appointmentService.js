import { apiRequest } from './apiConection';

/**
 * Servicio para manejar operaciones relacionadas con appointments
 */
export const appointmentService = {
  /**
   * Obtener slots disponibles de un doctor
   * @param {string} doctorId - ID del doctor
   * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
   * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Object>} - Slots disponibles
   */
  getAvailableSlots: async (doctorId, startDate, endDate) => {
    const token = localStorage.getItem('token');
    return await apiRequest(
      `/api/doctors/${doctorId}/available-slots?startDate=${startDate}&endDate=${endDate}`,
      'GET',
      null,
      token
    );
  },

  /**
   * Crear una nueva cita
   * @param {Object} appointmentData - Datos de la cita
   * @param {string} appointmentData.doctor_id - ID del doctor
   * @param {string} appointmentData.date - Fecha de la cita (YYYY-MM-DD)
   * @param {string} appointmentData.start_time - Hora de inicio (HH:MM:SS)
   * @param {string} appointmentData.end_time - Hora de fin (HH:MM:SS)
   * @returns {Promise<Object>} - Cita creada
   */
  createAppointment: async (appointmentData) => {
    const token = localStorage.getItem('token');
    return await apiRequest('/api/appointments', 'POST', appointmentData, token);
  },

  /**
   * Obtener citas de un paciente
   * @param {string} patientId - ID del paciente
   * @returns {Promise<Object>} - Lista de citas del paciente
   */
  getPatientAppointments: async (patientId) => {
    const token = localStorage.getItem('token');
    return await apiRequest(`/api/patients/${patientId}/appointments`, 'GET', null, token);
  },

  /**
   * Obtener citas de un doctor
   * @param {string} doctorId - ID del doctor
   * @returns {Promise<Object>} - Lista de citas del doctor
   */
  getDoctorAppointments: async (doctorId) => {
    const token = localStorage.getItem('token');
    return await apiRequest(`/api/doctors/${doctorId}/appointments`, 'GET', null, token);
  },

  /**
   * Actualizar estado de una cita
   * @param {string} appointmentId - ID de la cita
   * @param {string} status - Nuevo estado (pending, confirmed, cancelled)
   * @returns {Promise<Object>} - Cita actualizada
   */
  updateAppointmentStatus: async (appointmentId, status) => {
    const token = localStorage.getItem('token');
    return await apiRequest(`/api/appointments/${appointmentId}/status`, 'PATCH', { status }, token);
  },

  /**
   * Cancelar una cita (Admin)
   * @param {string} appointmentId - ID de la cita
   * @returns {Promise<void>}
   */
  cancelAppointment: async (appointmentId) => {
    const token = localStorage.getItem('token');
    return await apiRequest(`/api/appointments/${appointmentId}`, 'DELETE', null, token);
  },

  /**
   * Eliminar una cita
   * @param {string} appointmentId - ID de la cita
   * @returns {Promise<void>}
   */
  deleteAppointment: async (appointmentId) => {
    const token = localStorage.getItem('token');
    return await apiRequest(`/api/appointments/${appointmentId}`, 'DELETE', null, token);
  },

  /**
   * Validar fecha para reserva (mínimo 24 horas de anticipación)
   * @param {string} date - Fecha a validar (YYYY-MM-DD)
   * @returns {Object} - { isValid: boolean, message: string }
   */
  validateReservationDate: (date) => {
    const selectedDate = new Date(date);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (selectedDate < tomorrow) {
      return {
        isValid: false,
        message: 'Debe reservar con al menos 24 horas de anticipación'
      };
    }

    return { isValid: true, message: '' };
  },

  /**
   * Formatear horario para mostrar
   * @param {string} startTime - Hora de inicio (HH:MM:SS)
   * @param {string} endTime - Hora de fin (HH:MM:SS)
   * @param {number} durationMinutes - Duración en minutos
   * @returns {string} - Horario formateado
   */
  formatTimeSlot: (startTime, endTime, durationMinutes) => {
    const start = startTime.slice(0, 5);
    const end = endTime.slice(0, 5);
    return `${start} - ${end} (${durationMinutes} min)`;
  },

  /**
   * Obtener fecha mínima para reserva (mañana)
   * @returns {string} - Fecha en formato YYYY-MM-DD
   */
  getMinimumReservationDate: () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
}; 