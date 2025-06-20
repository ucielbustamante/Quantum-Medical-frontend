import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { X, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ManageSpecialtiesModal = ({ doctor, onClose }) => {
  const queryClient = useQueryClient();
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [currentDoctorSpecialties, setCurrentDoctorSpecialties] = useState(doctor.Specialties);

  useEffect(() => {
    setCurrentDoctorSpecialties(doctor.Specialties);
  }, [doctor.Specialties]);

  const { data: specialtiesData, isLoading: isLoadingSpecialties } = useQuery('specialties', async () => {
    const response = await api.get('/api/specialties');
    return response.data;
  });

  const allSpecialties = specialtiesData?.data || [];

  const addSpecialtyMutation = useMutation(
    async (specialty_id) => {
      if (!specialty_id) {
        throw new Error('Por favor, seleccione una especialidad');
      }
      const payload = {
        doctor_id: doctor.id,
        specialty_id: specialty_id,
      };
      const response = await api.post('/api/doctor-specialties', payload);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Especialidad añadida exitosamente');
        queryClient.invalidateQueries('doctors');
        
        const addedSpecialty = allSpecialties.find(s => s.id === selectedSpecialty);
        if(addedSpecialty) {
          setCurrentDoctorSpecialties(prev => [...prev, addedSpecialty]);
        }
        setSelectedSpecialty('');
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.data?.message || error.message || 'Error al añadir especialidad';
        toast.error(errorMessage);
      },
    }
  );

  const removeSpecialtyMutation = useMutation(
    async (specialty_id) => {
      await api.delete(`/api/doctor-specialties/${doctor.id}/${specialty_id}`);
      return specialty_id;
    },
    {
      onSuccess: (removed_specialty_id) => {
        toast.success('Especialidad eliminada exitosamente');
        queryClient.invalidateQueries('doctors');
        setCurrentDoctorSpecialties(prev => prev.filter(spec => spec.id !== removed_specialty_id));
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.data?.message || 'Error al eliminar especialidad';
        toast.error(errorMessage);
      },
    }
  );

  const handleAddSpecialty = (e) => {
    e.preventDefault();
    addSpecialtyMutation.mutate(selectedSpecialty);
  };

  const handleRemoveSpecialty = (specialtyId) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta especialidad del doctor?')) {
      removeSpecialtyMutation.mutate(specialtyId);
    }
  };

  const doctorSpecialtyIds = new Set(currentDoctorSpecialties.map((s) => s.id));
  const availableSpecialties = allSpecialties.filter((s) => !doctorSpecialtyIds.has(s.id));

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Gestionar Especialidades de Dr. {doctor.User.name} {doctor.User.lastname}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">Especialidades Actuales</h4>
            {currentDoctorSpecialties.length > 0 ? (
              <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {currentDoctorSpecialties.map((spec) => (
                  <li key={spec.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <span className="text-sm text-gray-700">{spec.name}</span>
                    <button
                      onClick={() => handleRemoveSpecialty(spec.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 disabled:opacity-50"
                      disabled={removeSpecialtyMutation.isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Este doctor no tiene especialidades asignadas.</p>
            )}
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">Añadir Nueva Especialidad</h4>
            {isLoadingSpecialties ? (
              <LoadingSpinner />
            ) : (
              <form onSubmit={handleAddSpecialty} className="flex items-center space-x-2">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="input flex-grow"
                  disabled={addSpecialtyMutation.isLoading}
                >
                  <option value="">Seleccione una especialidad</option>
                  {availableSpecialties.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!selectedSpecialty || addSpecialtyMutation.isLoading}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSpecialtiesModal; 