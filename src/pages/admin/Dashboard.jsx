import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Users,
  UserCheck,
  Heart,
  Calendar,
  FileText,
  Folder,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DashboardHome = () => {
  const navigate = useNavigate();

  const { data: usersData, isLoading: usersLoading } = useQuery(
    'users',
    async () => {
      const response = await api.post('/api/users/search', { limit: 1000 });
      return response.data;
    }
  );

  const { data: doctorsData, isLoading: doctorsLoading } = useQuery(
    'doctors',
    async () => {
      const response = await api.post('/api/doctors/search', { limit: 1000 });
      return response.data;
    }
  );

  const { data: patientsData, isLoading: patientsLoading } = useQuery(
    'patients',
    async () => {
      const response = await api.post('/api/patients/search', { limit: 1000 });
      return response.data;
    }
  );

  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery(
    'appointments',
    async () => {
      try {
        const doctorsResponse = await api.post('/api/doctors/search', { limit: 1000 });
        const doctors = doctorsResponse.data.data || [];
        
        let allAppointments = [];
        for (const doctor of doctors) {
          try {
            const response = await api.get(`/api/doctors/${doctor.id}/appointments`);
            if (response.data.data) {
              // Filtrar solo citas con patient_id (citas reales)
              const realAppointments = response.data.data.filter(apt => apt.patient_id !== null);
              allAppointments = [...allAppointments, ...realAppointments];
            }
          } catch (error) {
            console.warn(`Error getting appointments for doctor ${doctor.id}:`, error);
          }
        }
        
        return { data: allAppointments };
      } catch (error) {
        console.warn('Error getting appointments:', error);
        return { data: [] };
      }
    }
  );

  const { data: clinicalRecordsData, isLoading: recordsLoading } = useQuery(
    'clinicalRecords',
    async () => {
      try {
        const response = await api.get('/api/clinical-records');
        return response.data;
      } catch (error) {
        console.warn('Clinical records endpoint not available:', error);
        return { data: [] };
      }
    }
  );

  if (usersLoading || doctorsLoading || patientsLoading || appointmentsLoading || recordsLoading) {
    return <LoadingSpinner size="lg" className="mt-8" />;
  }

  const totalUsers = usersData?.data?.length || 0;
  const totalDoctors = doctorsData?.data?.length || 0;
  const totalPatients = patientsData?.data?.length || 0;
  const totalAppointments = appointmentsData?.data?.length || 0;
  const totalClinicalRecords = clinicalRecordsData?.data?.records?.length || 0;
  
  // Filtrar citas de hoy
  const today = new Date().toISOString().split('T')[0];
  const appointmentsToday = appointmentsData?.data?.filter(apt => {
    const appointmentDate = new Date(apt.date).toISOString().split('T')[0];
    return appointmentDate === today;
  }).length || 0;

  const statCards = [
    {
      name: 'Total Usuarios',
      value: totalUsers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Doctores',
      value: totalDoctors,
      icon: UserCheck,
      color: 'bg-green-500',
    },
    {
      name: 'Pacientes',
      value: totalPatients,
      icon: Heart,
      color: 'bg-purple-500',
    },
    {
      name: 'Citas Hoy',
      value: appointmentsToday,
      icon: Calendar,
      color: 'bg-yellow-500',
    },
    {
      name: 'Historiales',
      value: totalClinicalRecords,
      icon: FileText,
      color: 'bg-indigo-500',
    },
    {
      name: 'Total Citas',
      value: totalAppointments,
      icon: Folder,
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="mt-1 text-sm text-gray-500">
          Resumen general del sistema Quantum Medical
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-md ${stat.color}`}>
                      <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Citas Recientes
            </h3>
          </div>
          <div className="card-body">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {appointmentsData?.data?.slice(0, 5).map((appointment) => (
                  <li key={appointment.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {appointment.Patient?.User?.name?.charAt(0) || 'P'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {appointment.Patient?.User?.name} {appointment.Patient?.User?.lastname}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleDateString()} - {appointment.start_time}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status === 'confirmed' ? 'Confirmada' :
                           appointment.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                        </span>
                      </div>
                    </div>
                  </li>
                )) || (
                  <li className="py-4 text-center text-gray-500">
                    No hay citas recientes
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Usuarios Recientes
            </h3>
          </div>
          <div className="card-body">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {usersData?.data?.slice(0, 5).map((user) => (
                  <li key={user.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name} {user.lastname}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'Doctor' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </li>
                )) || (
                  <li className="py-4 text-center text-gray-500">
                    No hay usuarios recientes
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Acciones Rápidas
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button 
              onClick={() => navigate('/admin/users')}
              className="btn-primary"
            >
              <Users className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </button>
            <button 
              onClick={() => navigate('/admin/doctors')}
              className="btn-primary"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Nuevo Doctor
            </button>
            <button 
              onClick={() => navigate('/admin/patients')}
              className="btn-primary"
            >
              <Heart className="mr-2 h-4 w-4" />
              Nuevo Paciente
            </button>
            <button 
              onClick={() => navigate('/admin/appointments')}
              className="btn-primary"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Nueva Cita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <Routes>
      <Route index element={<DashboardHome />} />
    </Routes>
  );
};

export default Dashboard; 