import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  User,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const Patients = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    name: '',
    email: '',
    limit: 10,
    offset: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const { data: appointmentsData, isLoading, error } = useQuery(
    ['doctor-patients-from-appointments', user?.id],
    async () => {
      if (!user?.id) return { data: [] };
      try {
        const doctorResponse = await api.post('/api/doctors/search', { 
          email: user.email,
          limit: 1 
        });
        
        if (doctorResponse.data.data && doctorResponse.data.data.length > 0) {
          const doctorId = doctorResponse.data.data[0].id;
          const response = await api.get(`/api/doctors/${doctorId}/appointments`);
          return response.data;
        } else {
          console.warn('Doctor not found for user:', user.email);
          return { data: [] };
        }
      } catch (error) {
        console.error('Error getting doctor appointments for patients:', error);
        return { data: [] };
      }
    },
    { enabled: !!user?.id }
  );

  const doctorPatients = React.useMemo(() => {
    const appointments = appointmentsData?.data || [];
    if (!Array.isArray(appointments)) {
      return [];
    }
    
    const patientsMap = new Map();
    appointments.forEach(apt => {
      if (apt.Patient && apt.Patient.id) {
        patientsMap.set(apt.Patient.id, apt.Patient);
      }
    });
    
    return Array.from(patientsMap.values());
  }, [appointmentsData?.data]);

  const filteredPatients = React.useMemo(() => {
    if (!Array.isArray(doctorPatients)) return [];
    
    return doctorPatients.filter(patient => {
      if (!patient || !patient.User) return false;
      
      const fullName = `${patient.User.name || ''} ${patient.User.lastname || ''}`.toLowerCase();
      const searchName = searchParams.name.toLowerCase();
      const searchEmail = searchParams.email.toLowerCase();
      
      if (searchParams.name && !fullName.includes(searchName)) return false;
      if (searchParams.email && !patient.User.email?.toLowerCase().includes(searchEmail)) return false;
      
      return true;
    });
  }, [doctorPatients, searchParams]);

  const patientStats = React.useMemo(() => {
    const totalPatients = doctorPatients.length;
    const today = new Date();
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const appointments = appointmentsData?.data || [];
    const appointmentsThisWeek = Array.isArray(appointments) ? appointments.filter(apt => {
      if (!apt.date) return false;
      const aptDate = new Date(apt.date);
      return aptDate >= weekStart && aptDate <= today;
    }).length : 0;

    return {
      totalPatients,
      appointmentsThisWeek,
      totalRecords: 0
    };
  }, [doctorPatients, appointmentsData?.data]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(prev => ({ ...prev, offset: 0 }));
  };

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  const handleView = (patient) => {
    setSelectedPatient(patient);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="mt-8" />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">
          Error al cargar datos: {error?.message}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-outline mt-4"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Pacientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona la información de tus pacientes
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Pacientes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {patientStats.totalPatients}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Citas Esta Semana</p>
              <p className="text-2xl font-semibold text-gray-900">
                {patientStats.appointmentsThisWeek}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Historiales</p>
              <p className="text-2xl font-semibold text-gray-900">
                {patientStats.totalRecords}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Buscar Pacientes</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </button>
              <button
                onClick={() => {
                  setSearchParams({
                    name: '',
                    email: '',
                    limit: 10,
                    offset: 0,
                  });
                }}
                className="btn-outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Limpiar
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={searchParams.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input"
                  placeholder="Buscar por nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={searchParams.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input"
                  placeholder="Buscar por email"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Pacientes ({filteredPatients.length})
          </h3>
        </div>
        <div className="card-body">
          {filteredPatients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        {patient.User?.name} {patient.User?.lastname}
                      </h4>
                      <p className="text-sm text-gray-500">{patient.User?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Edad:</span>
                      <span>{getAge(patient.birth_date)} años</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Género:</span>
                      <span>{patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Femenino' : 'No especificado'}</span>
                    </div>

                    {patient.User?.phone && (
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Teléfono:</span>
                        <span>{patient.User.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Registro:</span>
                      <span>{formatDate(patient.createdAt)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleView(patient)}
                      className="flex-1 btn-outline text-sm"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pacientes</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchParams.name || searchParams.email
                  ? 'No se encontraron pacientes con los criterios especificados.'
                  : 'No tienes pacientes asignados.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles del Paciente
                </h3>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Patient Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Información Personal</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedPatient.User?.name} {selectedPatient.User?.lastname}
                        </p>
                        <p className="text-sm text-gray-500">{selectedPatient.User?.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedPatient.birth_date ? formatDate(selectedPatient.birth_date) : 'No especificada'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Edad</label>
                        <p className="mt-1 text-sm text-gray-900">{getAge(selectedPatient.birth_date)} años</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Género</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedPatient.gender === 'M' ? 'Masculino' : selectedPatient.gender === 'F' ? 'Femenino' : 'No especificado'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">DNI</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedPatient.User?.dni || 'No especificado'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Información de Contacto</h4>
                  <div className="space-y-3">
                    {selectedPatient.User?.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{selectedPatient.User.phone}</span>
                      </div>
                    )}
                    {selectedPatient.User?.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{selectedPatient.User.email}</span>
                      </div>
                    )}
                    {selectedPatient.User?.address && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{selectedPatient.User.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Información Médica</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Grupo Sanguíneo</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedPatient.blood_type || 'No especificado'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Alergias</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedPatient.allergies || 'Ninguna conocida'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Condiciones Médicas</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPatient.medical_conditions || 'Ninguna conocida'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="btn-outline"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;