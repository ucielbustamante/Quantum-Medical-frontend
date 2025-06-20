import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { X, Calendar, Clock, User, Stethoscope, Search, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const AppointmentForm = ({ appointment, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    doctor_id: '',
    patient_id: '',
    date: '',
    start_time: '',
    end_time: '',
    status: 'confirmed'
  });
  const [errors, setErrors] = useState({});
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showDoctorSearch, setShowDoctorSearch] = useState(false);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [patientSearchTerm, setPatientSearchTerm] = useState('');

  const { data: doctorsData } = useQuery(
    ['doctors', doctorSearchTerm],
    async () => {
      if (!doctorSearchTerm.trim()) return { data: [] };
      const response = await api.post('/api/doctors/search', {
        name: doctorSearchTerm,
        limit: 10
      });
      return response.data;
    },
    { enabled: !!doctorSearchTerm.trim() }
  );

  const { data: patientsData } = useQuery(
    ['patients', patientSearchTerm],
    async () => {
      if (!patientSearchTerm.trim()) return { data: [] };
      const response = await api.post('/api/patients/search', {
        name: patientSearchTerm,
        limit: 10
      });
      return response.data;
    },
    { enabled: !!patientSearchTerm.trim() }
  );

  const { data: slotsData } = useQuery(
    ['available-slots', formData.doctor_id, formData.date],
    async () => {
      if (!formData.doctor_id || !formData.date) return { data: [] };
      const endDate = new Date(formData.date);
      endDate.setDate(endDate.getDate() + 7);
      
      const response = await api.get(`/api/doctors/${formData.doctor_id}/available-slots`, {
        params: {
          startDate: formData.date,
          endDate: endDate.toISOString().split('T')[0]
        }
      });
      return response.data;
    },
    { enabled: !!formData.doctor_id && !!formData.date }
  );

  useEffect(() => {
    if (appointment) {
      const correctDate = appointment.date ? new Date(appointment.date) : null;
      setFormData({
        doctor_id: appointment.doctor_id || '',
        patient_id: appointment.patient_id || '',
        date: correctDate 
          ? `${correctDate.getUTCFullYear()}-${String(correctDate.getUTCMonth() + 1).padStart(2, '0')}-${String(correctDate.getUTCDate()).padStart(2, '0')}`
          : '',
        start_time: appointment.start_time || '',
        end_time: appointment.end_time || '',
        status: appointment.status || 'confirmed'
      });
      
      if (appointment.Doctor) {
        setSelectedDoctor(appointment.Doctor);
      }
      if (appointment.Patient) {
        setSelectedPatient(appointment.Patient);
      }
    }
  }, [appointment]);

  useEffect(() => {
    if (slotsData?.data) {
      setAvailableSlots(slotsData.data);
    }
  }, [slotsData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.doctor_id) {
      newErrors.doctor_id = 'El doctor es requerido';
    }

    if (!formData.patient_id) {
      newErrors.patient_id = 'El paciente es requerido';
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es requerida';
    } else {
      const selectedDate = new Date(formData.date + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = 'La fecha de la cita no puede ser en el pasado.';
      }
    }

    if (!formData.start_time) {
      newErrors.start_time = 'La hora de inicio es requerida';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'La hora de fin es requerida';
    }

    if (formData.start_time && formData.end_time) {
      if (formData.start_time >= formData.end_time) {
        newErrors.end_time = 'La hora de fin debe ser posterior a la hora de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const localDate = new Date(formData.date + 'T00:00:00');
      
      const submitData = {
        doctor_id: formData.doctor_id,
        patient_id: formData.patient_id,
        date: localDate,
        start_time: formData.start_time,
        end_time: formData.end_time,
        status: formData.status,
      };
      onSubmit(submitData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData(prev => ({ ...prev, doctor_id: doctor.id }));
    setShowDoctorSearch(false);
    setDoctorSearchTerm('');
    setAvailableSlots([]);
    setFormData(prev => ({ ...prev, start_time: '', end_time: '' }));
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, patient_id: patient.id }));
    setShowPatientSearch(false);
    setPatientSearchTerm('');
  };

  const handleSlotSelect = (slot) => {
    setFormData(prev => ({
      ...prev,
      start_time: slot.start_time,
      end_time: slot.end_time
    }));
    setErrors(prev => ({ ...prev, start_time: '', end_time: '' }));
  };

  const formatTime = (time) => {
    return time.slice(0, 5);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {appointment ? 'Editar Cita' : 'Nueva Cita'}
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
            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor *
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={selectedDoctor ? `${selectedDoctor.User?.name} ${selectedDoctor.User?.lastname}` : ''}
                  onChange={(e) => {
                    setDoctorSearchTerm(e.target.value);
                    setShowDoctorSearch(true);
                    if (!e.target.value) {
                      setSelectedDoctor(null);
                      setFormData(prev => ({ ...prev, doctor_id: '' }));
                    }
                  }}
                  className={`input pl-10 ${errors.doctor_id ? 'border-red-500' : ''}`}
                  placeholder="Buscar doctor..."
                  readOnly={!!selectedDoctor}
                />
                {selectedDoctor && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDoctor(null);
                      setFormData(prev => ({ ...prev, doctor_id: '' }));
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {showDoctorSearch && !selectedDoctor && doctorsData?.data && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {doctorsData.data.map((doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => handleDoctorSelect(doctor)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                    >
                      <div className="font-medium">{doctor.User?.name} {doctor.User?.lastname}</div>
                      <div className="text-sm text-gray-500">{doctor.User?.email}</div>
                      {doctor.Specialties && doctor.Specialties.length > 0 && (
                        <div className="text-xs text-blue-600">
                          {doctor.Specialties.map(s => s.name).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {errors.doctor_id && (
                <p className="mt-1 text-sm text-red-600">{errors.doctor_id}</p>
              )}
            </div>

            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={selectedPatient ? `${selectedPatient.User?.name} ${selectedPatient.User?.lastname}` : ''}
                  onChange={(e) => {
                    setPatientSearchTerm(e.target.value);
                    setShowPatientSearch(true);
                    if (!e.target.value) {
                      setSelectedPatient(null);
                      setFormData(prev => ({ ...prev, patient_id: '' }));
                    }
                  }}
                  className={`input pl-10 ${errors.patient_id ? 'border-red-500' : ''}`}
                  placeholder="Buscar paciente..."
                  readOnly={!!selectedPatient}
                />
                {selectedPatient && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatient(null);
                      setFormData(prev => ({ ...prev, patient_id: '' }));
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {showPatientSearch && !selectedPatient && patientsData?.data && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {patientsData.data.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                    >
                      <div className="font-medium">{patient.User?.name} {patient.User?.lastname}</div>
                      <div className="text-sm text-gray-500">{patient.User?.email}</div>
                    </div>
                  ))}
                </div>
              )}
              {errors.patient_id && (
                <p className="mt-1 text-sm text-red-600">{errors.patient_id}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`input pl-10 ${errors.date ? 'border-red-500' : ''}`}
                  min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Available Slots */}
            {formData.doctor_id && formData.date && availableSlots.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horarios Disponibles
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {availableSlots
                    .filter(slot => slot.date === formData.date)
                    .map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleSlotSelect(slot)}
                        className={`p-2 text-sm border rounded-md hover:bg-blue-50 ${
                          formData.start_time === slot.start_time && formData.end_time === slot.end_time
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Inicio *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                    className={`input pl-10 ${errors.start_time ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.start_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Fin *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                    className={`input pl-10 ${errors.end_time ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.end_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="input"
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmado</option>
                <option value="cancelled">Cancelado</option>
              </select>
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
                    {appointment ? 'Actualizando...' : 'Creando...'}
                  </div>
                ) : (
                  appointment ? 'Actualizar Cita' : 'Crear Cita'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
